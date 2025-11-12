import { join } from "path";
import { mkdirSync, existsSync } from "fs";
import { readFileSync } from "fs";

const storageDir = process.env.STORAGE_DIR || join(process.cwd(), "storage");
mkdirSync(storageDir, { recursive: true });

export function getStoragePath(storageKey: string): string {
  return join(storageDir, storageKey);
}

export async function createSignedUploadUrls(_bucket: string, objects: { path: string }[], baseUrl?: string): Promise<{ path: string; url: string }[]> {
  // For filesystem, we return API endpoints that will handle the upload
  const url = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  return objects.map((obj) => ({
    path: obj.path,
    url: `${url}/api/upload/file?path=${encodeURIComponent(obj.path)}`,
  }));
}

export async function createSignedDownloadUrls(_bucket: string, objects: { path: string; expiresIn?: number }[], baseUrl?: string): Promise<{ path: string; url: string }[]> {
  // For filesystem, we return API endpoints that will serve the files
  const url = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  return objects.map((obj) => ({
    path: obj.path,
    url: `${url}/api/download?path=${encodeURIComponent(obj.path)}`,
  }));
}

export function fileExists(storageKey: string): boolean {
  return existsSync(getStoragePath(storageKey));
}

export function readFile(storageKey: string): Buffer {
  return readFileSync(getStoragePath(storageKey));
}
