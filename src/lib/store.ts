import db from "./db";

export type StoredFileMeta = { name: string; size: number; type?: string; storageKey: string };

export type UploadRecord = {
  id: string;
  tokenHash: string;
  expiry: number | null;
  maxDownloads: number | null;
  downloadCount: number;
  passwordProtected: boolean;
  clientEncrypted: boolean;
  createdAt: number;
  files: StoredFileMeta[];
};

export async function putUpload(record: UploadRecord): Promise<void> {
  const stmt = db.prepare(`
    INSERT INTO uploads (id, token_hash, expiry, max_downloads, download_count, password_protected, client_encrypted, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    record.id,
    record.tokenHash,
    record.expiry,
    record.maxDownloads,
    record.downloadCount,
    record.passwordProtected ? 1 : 0,
    record.clientEncrypted ? 1 : 0,
    record.createdAt
  );

  if (record.files?.length) {
    const fileStmt = db.prepare(`
      INSERT INTO files (upload_id, name, size, type, storage_key)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertFiles = db.transaction((files: StoredFileMeta[], uploadId: string) => {
      for (const f of files) {
        fileStmt.run(uploadId, f.name, f.size, f.type || null, f.storageKey);
      }
    });
    insertFiles(record.files, record.id);
  }
}

export async function findByTokenHash(tokenHash: string): Promise<UploadRecord | undefined> {
  const upload = db.prepare("SELECT * FROM uploads WHERE token_hash = ?").get(tokenHash) as any;
  if (!upload) return undefined;

  const files = db.prepare("SELECT name, size, type, storage_key FROM files WHERE upload_id = ?").all(upload.id) as any[];

  return {
    id: upload.id,
    tokenHash: upload.token_hash,
    expiry: upload.expiry,
    maxDownloads: upload.max_downloads,
    downloadCount: upload.download_count,
    passwordProtected: upload.password_protected === 1,
    clientEncrypted: upload.client_encrypted === 1,
    createdAt: upload.created_at,
    files: files.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type || undefined,
      storageKey: f.storage_key,
    })),
  };
}

export async function incrementDownload(id: string): Promise<void> {
  const stmt = db.prepare("UPDATE uploads SET download_count = download_count + 1 WHERE id = ?");
  stmt.run(id);
}

export async function purgeExpired(now = Date.now()): Promise<void> {
  const stmt = db.prepare("DELETE FROM uploads WHERE expiry IS NOT NULL AND expiry < ?");
  stmt.run(now);
}
