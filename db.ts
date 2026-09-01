import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  preferredLanguage: 'en' | 'am';
  createdAt: string;
  lastSyncedAt?: string;
  data?: any;
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
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      preferred_language TEXT NOT NULL DEFAULT 'en',
      created_at TIMESTAMPTZ NOT NULL,
      last_synced_at TIMESTAMPTZ,
      data JSONB
    )
  `;
  await getSql()`
    CREATE TABLE IF NOT EXISTS tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL
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
  password_hash: string;
  password_salt: string;
  preferred_language: string;
  created_at: string;
  last_synced_at: string | null;
  data: unknown | null;
}

function rowToUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    preferredLanguage: row.preferred_language as 'en' | 'am',
    createdAt: row.created_at,
    lastSyncedAt: row.last_synced_at ?? undefined,
    data: row.data ?? undefined, // JSONB comes back already parsed
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

export async function createUser(user: StoredUser): Promise<void> {
  await getSql()`
    INSERT INTO users (id, email, name, password_hash, password_salt, preferred_language, created_at, last_synced_at, data)
    VALUES (${user.id}, ${user.email}, ${user.name}, ${user.passwordHash}, ${user.passwordSalt}, ${user.preferredLanguage}, ${user.createdAt}, ${user.lastSyncedAt ?? null}, ${user.data ? JSON.stringify(user.data) : null})
  `;
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

// Seed the demo account once, on first boot -- kept for the same instant
// multi-device demo purpose the earlier in-memory version served.
export async function seedDemoUserIfMissing(): Promise<void> {
  if (await getUserByEmail('davidabdisa40@gmail.com')) return;
  const { hash, salt } = hashPassword('password123');
  await createUser({
    id: 'user-berean-demo',
    email: 'davidabdisa40@gmail.com',
    name: 'David Abdisa',
    passwordHash: hash,
    passwordSalt: salt,
    preferredLanguage: 'en',
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  });
}
