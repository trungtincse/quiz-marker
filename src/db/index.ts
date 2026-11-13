import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "quiz.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

/** Uploaded images live next to the database file. */
export const uploadsDir = path.join(path.dirname(dbPath), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const globalForDb = globalThis as unknown as { sqlite?: Database.Database };
const sqlite = globalForDb.sqlite ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") globalForDb.sqlite = sqlite;

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Personal app: create tables on first run instead of a migration step.
sqlite.exec(`
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  image TEXT,
  options TEXT NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS questions_quiz_idx ON questions(quiz_id, position);
CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS attempts_quiz_idx ON attempts(quiz_id);
CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  image TEXT,
  options TEXT NOT NULL,
  correct_index INTEGER NOT NULL,
  selected_index INTEGER,
  explanation TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS answers_attempt_idx ON answers(attempt_id, position);
`);

// Upgrade databases created before a column existed.
for (const table of ["questions", "answers"]) {
  const cols = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === "image")) sqlite.exec(`ALTER TABLE ${table} ADD COLUMN image TEXT`);
}

export const db = drizzle(sqlite, { schema });
export { schema };
