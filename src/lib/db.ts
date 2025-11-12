import Database from "better-sqlite3";
import { join } from "path";
import { mkdirSync } from "fs";

const dbDir = process.env.DATA_DIR || join(process.cwd(), "data");
mkdirSync(dbDir, { recursive: true });

const dbPath = join(dbDir, "fluxsend.db");
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    expiry INTEGER,
    max_downloads INTEGER,
    download_count INTEGER NOT NULL DEFAULT 0,
    password_protected INTEGER NOT NULL DEFAULT 0,
    client_encrypted INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_id TEXT NOT NULL,
    name TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT,
    storage_key TEXT NOT NULL,
    FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_files_upload_id ON files(upload_id);
  CREATE INDEX IF NOT EXISTS idx_uploads_token_hash ON uploads(token_hash);
`);

export default db;

