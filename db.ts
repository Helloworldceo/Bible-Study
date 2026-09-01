import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

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

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(path.join(DATA_DIR, 'berean.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    created_at TEXT NOT NULL,
    last_synced_at TEXT,
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
  );
`);

// --- Password hashing (salted scrypt -- the old code used unsalted sha256,
// which is crackable via precomputed rainbow tables; scrypt is deliberately
// slow/memory-hard, which is what you want for password storage). ---
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
  data: string | null;
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
    data: row.data ? JSON.parse(row.data) : undefined,
  };
}

const stmts = {
  getByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  getById: db.prepare('SELECT * FROM users WHERE id = ?'),
  insert: db.prepare(`
    INSERT INTO users (id, email, name, password_hash, password_salt, preferred_language, created_at, last_synced_at, data)
    VALUES (@id, @email, @name, @passwordHash, @passwordSalt, @preferredLanguage, @createdAt, @lastSyncedAt, @data)
  `),
  updateData: db.prepare('UPDATE users SET data = ?, last_synced_at = ? WHERE id = ?'),
  insertToken: db.prepare('INSERT INTO tokens (token, user_id, created_at) VALUES (?, ?, ?)'),
  getTokenUserId: db.prepare('SELECT user_id FROM tokens WHERE token = ?'),
};

export function getUserByEmail(email: string): StoredUser | undefined {
  const row = stmts.getByEmail.get(email) as UserRow | undefined;
  return row ? rowToUser(row) : undefined;
}

export function getUserById(id: string): StoredUser | undefined {
  const row = stmts.getById.get(id) as UserRow | undefined;
  return row ? rowToUser(row) : undefined;
}

export function createUser(user: StoredUser): void {
  stmts.insert.run({
    id: user.id,
    email: user.email,
    name: user.name,
    passwordHash: user.passwordHash,
    passwordSalt: user.passwordSalt,
    preferredLanguage: user.preferredLanguage,
    createdAt: user.createdAt,
    lastSyncedAt: user.lastSyncedAt ?? null,
    data: user.data ? JSON.stringify(user.data) : null,
  });
}

export function updateUserData(userId: string, data: any, syncedAt: string): void {
  stmts.updateData.run(JSON.stringify(data), syncedAt, userId);
}

export function createToken(token: string, userId: string): void {
  stmts.insertToken.run(token, userId, new Date().toISOString());
}

export function getUserIdByToken(token: string): string | undefined {
  const row = stmts.getTokenUserId.get(token) as { user_id: string } | undefined;
  return row?.user_id;
}

// Seed the demo account once, on first boot -- kept for the same instant
// multi-device demo purpose the in-memory version served, now persisted.
export function seedDemoUserIfMissing(): void {
  if (getUserByEmail('davidabdisa40@gmail.com')) return;
  const { hash, salt } = hashPassword('password123');
  createUser({
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
