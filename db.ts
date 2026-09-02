import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  // Absent for Google-only accounts -- there's no password to verify against.
  passwordHash?: string;
  passwordSalt?: string;
  googleId?: string;
  isAdmin: boolean;
  preferredLanguage: 'en' | 'am';
  createdAt: string;
  lastSyncedAt?: string;
  data?: any;
  // Absent for accounts created before the Friends feature -- they choose
  // one the first time they open it.
  username?: string;
}

// Lazy, like getGeminiClient() in server.ts -- module-level imports resolve
// (and this file's top-level code runs) before server.ts's dotenv.config()
// call executes, so reading process.env.DATABASE_URL up here would always
// see it as unset.
type SqlClient = ReturnType<typeof neon>;
let sqlClient: SqlClient | null = null;
function getSql(): SqlClient {
  if (!sqlClient) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not set. Copy .env.example to .env and set it to your Neon connection string (use the pooled connection, without channel_binding=require).'
      );
    }
    sqlClient = neon(connectionString);
  }
  return sqlClient;
}

// Runs once at server startup (see server.ts) -- idempotent, safe to run on every boot.
export async function initDb(): Promise<void> {
  await getSql()`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      password_salt TEXT,
      google_id TEXT UNIQUE,
      is_admin BOOLEAN NOT NULL DEFAULT false,
      preferred_language TEXT NOT NULL DEFAULT 'en',
      created_at TIMESTAMPTZ NOT NULL,
      last_synced_at TIMESTAMPTZ,
      data JSONB
    )
  `;
  // The table above only applies to a fresh database -- these bring an
  // already-deployed one (password columns NOT NULL, no google_id/is_admin)
  // up to the same shape. All idempotent, safe to run on every boot.
  await getSql()`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`;
  await getSql()`ALTER TABLE users ALTER COLUMN password_salt DROP NOT NULL`;
  await getSql()`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE`;
  await getSql()`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false`;
  // Nullable: existing accounts predate usernames and pick one the first
  // time they open Friends; new registrations set it immediately.
  await getSql()`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE`;
  await getSql()`
    CREATE TABLE IF NOT EXISTS tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL
    )
  `;
  // Single global row (id=1) -- one Discord server/webhook for the whole
  // app, not per-user. This is what makes the daily cron job possible at
  // all: the old design kept this in the browser's local storage, which a
  // server-side scheduled job has no way to read.
  await getSql()`
    CREATE TABLE IF NOT EXISTS discord_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      webhook_url TEXT,
      channel_name TEXT,
      server_name TEXT,
      is_enabled BOOLEAN NOT NULL DEFAULT false,
      language TEXT NOT NULL DEFAULT 'both',
      include_devotional_snippet BOOLEAN NOT NULL DEFAULT true,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT single_row CHECK (id = 1)
    )
  `;
  await getSql()`
    CREATE TABLE IF NOT EXISTS discord_delivery_log (
      id SERIAL PRIMARY KEY,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      verse_ref TEXT NOT NULL,
      trigger_source TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT
    )
  `;
  // A single row per request; once accepted, that same row *is* the
  // friendship (no separate friends table) -- "are these two friends" is
  // just "is there an accepted row between them in either direction".
  await getSql()`
    CREATE TABLE IF NOT EXISTS friend_requests (
      id SERIAL PRIMARY KEY,
      from_user_id TEXT NOT NULL REFERENCES users(id),
      to_user_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      responded_at TIMESTAMPTZ
    )
  `;
}

// --- Password hashing (salted scrypt -- the original code used unsalted
// sha256, which is crackable via precomputed rainbow tables; scrypt is
// deliberately slow/memory-hard, which is what you want for passwords). ---
const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, useSalt, SCRYPT_KEYLEN).toString('hex');
  return { hash, salt: useSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidate = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const stored = Buffer.from(hash, 'hex');
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
}

// --- Row <-> StoredUser mapping ---
interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  password_salt: string | null;
  google_id: string | null;
  is_admin: boolean;
  preferred_language: string;
  created_at: string;
  last_synced_at: string | null;
  data: unknown | null;
  username: string | null;
}

function rowToUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash ?? undefined,
    passwordSalt: row.password_salt ?? undefined,
    googleId: row.google_id ?? undefined,
    isAdmin: row.is_admin,
    preferredLanguage: row.preferred_language as 'en' | 'am',
    createdAt: row.created_at,
    lastSyncedAt: row.last_synced_at ?? undefined,
    data: row.data ?? undefined, // JSONB comes back already parsed
    username: row.username ?? undefined,
  };
}

export async function getUserByEmail(email: string): Promise<StoredUser | undefined> {
  const rows = (await getSql()`SELECT * FROM users WHERE email = ${email}`) as UserRow[];
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export async function getUserById(id: string): Promise<StoredUser | undefined> {
  const rows = (await getSql()`SELECT * FROM users WHERE id = ${id}`) as UserRow[];
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export async function getUserByGoogleId(googleId: string): Promise<StoredUser | undefined> {
  const rows = (await getSql()`SELECT * FROM users WHERE google_id = ${googleId}`) as UserRow[];
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

// Whoever registers first (by any method) becomes the site's one admin
// account -- there's no invite flow or role management UI, so this is the
// entire bootstrap mechanism. Safe as long as the admin claims it promptly
// after deploying, since the database starts empty.
export async function getUserCount(): Promise<number> {
  const rows = (await getSql()`SELECT COUNT(*)::int AS count FROM users`) as { count: number }[];
  return rows[0]?.count ?? 0;
}

export async function createUser(user: StoredUser): Promise<void> {
  await getSql()`
    INSERT INTO users (id, email, name, password_hash, password_salt, google_id, is_admin, preferred_language, created_at, last_synced_at, data, username)
    VALUES (${user.id}, ${user.email}, ${user.name}, ${user.passwordHash ?? null}, ${user.passwordSalt ?? null}, ${user.googleId ?? null}, ${user.isAdmin}, ${user.preferredLanguage}, ${user.createdAt}, ${user.lastSyncedAt ?? null}, ${user.data ? JSON.stringify(user.data) : null}, ${user.username ?? null})
  `;
}

export async function getUserByUsername(username: string): Promise<StoredUser | undefined> {
  const rows = (await getSql()`SELECT * FROM users WHERE username = ${username}`) as UserRow[];
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export async function setUsername(userId: string, username: string): Promise<void> {
  await getSql()`UPDATE users SET username = ${username} WHERE id = ${userId}`;
}

// Links a Google identity to an existing email/password account the first
// time someone signs in with Google using the same email they already
// registered with -- so they end up with one account, not two.
export async function linkGoogleAccount(userId: string, googleId: string): Promise<void> {
  await getSql()`UPDATE users SET google_id = ${googleId} WHERE id = ${userId}`;
}

export async function updateUserData(userId: string, data: any, syncedAt: string): Promise<void> {
  await getSql()`UPDATE users SET data = ${JSON.stringify(data)}, last_synced_at = ${syncedAt} WHERE id = ${userId}`;
}

export async function createToken(token: string, userId: string): Promise<void> {
  await getSql()`INSERT INTO tokens (token, user_id, created_at) VALUES (${token}, ${userId}, ${new Date().toISOString()})`;
}

export async function getUserIdByToken(token: string): Promise<string | undefined> {
  const rows = (await getSql()`SELECT user_id FROM tokens WHERE token = ${token}`) as { user_id: string }[];
  return rows[0]?.user_id;
}

// --- Discord daily-verse bot: server-side config + delivery history ---
export interface DiscordConfig {
  webhookUrl: string;
  channelName: string;
  serverName: string;
  isEnabled: boolean;
  language: 'both' | 'en' | 'am';
  includeDevotionalSnippet: boolean;
  updatedAt?: string;
}

interface DiscordConfigRow {
  webhook_url: string | null;
  channel_name: string | null;
  server_name: string | null;
  is_enabled: boolean;
  language: string;
  include_devotional_snippet: boolean;
  updated_at: string;
}

function rowToDiscordConfig(row: DiscordConfigRow): DiscordConfig {
  return {
    webhookUrl: row.webhook_url ?? '',
    channelName: row.channel_name ?? '',
    serverName: row.server_name ?? '',
    isEnabled: row.is_enabled,
    language: row.language as 'both' | 'en' | 'am',
    includeDevotionalSnippet: row.include_devotional_snippet ?? true,
    updatedAt: row.updated_at,
  };
}

export async function getDiscordConfig(): Promise<DiscordConfig | undefined> {
  const rows = (await getSql()`SELECT * FROM discord_config WHERE id = 1`) as DiscordConfigRow[];
  return rows[0] ? rowToDiscordConfig(rows[0]) : undefined;
}

export async function saveDiscordConfig(config: DiscordConfig): Promise<void> {
  await getSql()`
    INSERT INTO discord_config (id, webhook_url, channel_name, server_name, is_enabled, language, include_devotional_snippet, updated_at)
    VALUES (1, ${config.webhookUrl}, ${config.channelName}, ${config.serverName}, ${config.isEnabled}, ${config.language}, ${config.includeDevotionalSnippet}, now())
    ON CONFLICT (id) DO UPDATE SET
      webhook_url = EXCLUDED.webhook_url,
      channel_name = EXCLUDED.channel_name,
      server_name = EXCLUDED.server_name,
      is_enabled = EXCLUDED.is_enabled,
      language = EXCLUDED.language,
      include_devotional_snippet = EXCLUDED.include_devotional_snippet,
      updated_at = now()
  `;
}

export interface DiscordDeliveryLogEntry {
  sentAt: string;
  verseRef: string;
  triggerSource: 'cron' | 'manual';
  status: 'success' | 'error';
  errorMessage?: string;
}

export async function logDiscordDelivery(entry: DiscordDeliveryLogEntry): Promise<void> {
  await getSql()`
    INSERT INTO discord_delivery_log (verse_ref, trigger_source, status, error_message)
    VALUES (${entry.verseRef}, ${entry.triggerSource}, ${entry.status}, ${entry.errorMessage ?? null})
  `;
}

export async function getRecentDiscordDeliveries(limit = 10): Promise<DiscordDeliveryLogEntry[]> {
  const rows = (await getSql()`
    SELECT sent_at, verse_ref, trigger_source, status, error_message
    FROM discord_delivery_log
    ORDER BY sent_at DESC
    LIMIT ${limit}
  `) as { sent_at: string; verse_ref: string; trigger_source: string; status: string; error_message: string | null }[];
  return rows.map((r) => ({
    sentAt: r.sent_at,
    verseRef: r.verse_ref,
    triggerSource: r.trigger_source as 'cron' | 'manual',
    status: r.status as 'success' | 'error',
    errorMessage: r.error_message ?? undefined,
  }));
}

// Has a *successful* delivery already gone out today (UTC)? Guards against
// double-posting if the cron fires more than once, or overlaps a manual send.
export async function hasSuccessfulDeliveryToday(): Promise<boolean> {
  const rows = (await getSql()`
    SELECT 1 FROM discord_delivery_log
    WHERE status = 'success' AND sent_at >= date_trunc('day', now())
    LIMIT 1
  `) as unknown[];
  return rows.length > 0;
}

// --- Friends: mutual friend requests + streak-with-a-friend ---
// No separate "friendships" table -- an accepted row in friend_requests
// *is* the friendship, checked in either direction.

export interface FriendRequestSummary {
  requestId: number;
  userId: string;
  username: string;
  name: string;
  createdAt: string;
}

export interface FriendSummary {
  userId: string;
  username: string;
  name: string;
  readingDates: string[];
  streakDays: number;
  since: string;
}

// Any existing row between the two users, pending or accepted, in either
// direction -- callers use this to stop duplicate requests and to block
// re-requesting someone you're already friends with.
export async function getExistingRequestBetween(userA: string, userB: string): Promise<{ id: number; status: string } | undefined> {
  const rows = (await getSql()`
    SELECT id, status FROM friend_requests
    WHERE (from_user_id = ${userA} AND to_user_id = ${userB})
       OR (from_user_id = ${userB} AND to_user_id = ${userA})
    ORDER BY created_at DESC
    LIMIT 1
  `) as { id: number; status: string }[];
  return rows[0];
}

export async function createFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
  await getSql()`INSERT INTO friend_requests (from_user_id, to_user_id) VALUES (${fromUserId}, ${toUserId})`;
}

export async function getIncomingRequests(userId: string): Promise<FriendRequestSummary[]> {
  const rows = (await getSql()`
    SELECT fr.id AS request_id, u.id AS user_id, u.username, u.name, fr.created_at
    FROM friend_requests fr
    JOIN users u ON u.id = fr.from_user_id
    WHERE fr.to_user_id = ${userId} AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
  `) as { request_id: number; user_id: string; username: string; name: string; created_at: string }[];
  return rows.map((r) => ({ requestId: r.request_id, userId: r.user_id, username: r.username, name: r.name, createdAt: r.created_at }));
}

export async function getOutgoingRequests(userId: string): Promise<FriendRequestSummary[]> {
  const rows = (await getSql()`
    SELECT fr.id AS request_id, u.id AS user_id, u.username, u.name, fr.created_at
    FROM friend_requests fr
    JOIN users u ON u.id = fr.to_user_id
    WHERE fr.from_user_id = ${userId} AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
  `) as { request_id: number; user_id: string; username: string; name: string; created_at: string }[];
  return rows.map((r) => ({ requestId: r.request_id, userId: r.user_id, username: r.username, name: r.name, createdAt: r.created_at }));
}

// Returns the row so the caller can confirm the responding user was really
// the addressee before treating it as authorized.
export async function respondToFriendRequest(requestId: number, respondingUserId: string, accept: boolean): Promise<{ id: number; from_user_id: string; to_user_id: string } | undefined> {
  const rows = (await getSql()`
    UPDATE friend_requests
    SET status = ${accept ? 'accepted' : 'declined'}, responded_at = now()
    WHERE id = ${requestId} AND to_user_id = ${respondingUserId} AND status = 'pending'
    RETURNING id, from_user_id, to_user_id
  `) as { id: number; from_user_id: string; to_user_id: string }[];
  return rows[0];
}

export async function getFriends(userId: string): Promise<FriendSummary[]> {
  const rows = (await getSql()`
    SELECT
      u.id AS user_id, u.username, u.name, u.data,
      fr.responded_at AS since
    FROM friend_requests fr
    JOIN users u ON u.id = CASE WHEN fr.from_user_id = ${userId} THEN fr.to_user_id ELSE fr.from_user_id END
    WHERE (fr.from_user_id = ${userId} OR fr.to_user_id = ${userId}) AND fr.status = 'accepted'
    ORDER BY fr.responded_at DESC
  `) as { user_id: string; username: string; name: string; data: any; since: string }[];
  return rows.map((r) => ({
    userId: r.user_id,
    username: r.username,
    name: r.name,
    readingDates: r.data?.stats?.readingDates ?? [],
    streakDays: r.data?.stats?.streakDays ?? 0,
    since: r.since,
  }));
}

export async function removeFriendship(userId: string, friendId: string): Promise<void> {
  await getSql()`
    DELETE FROM friend_requests
    WHERE status = 'accepted'
      AND ((from_user_id = ${userId} AND to_user_id = ${friendId})
        OR (from_user_id = ${friendId} AND to_user_id = ${userId}))
  `;
}
