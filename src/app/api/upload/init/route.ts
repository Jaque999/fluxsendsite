import { NextResponse } from "next/server";
import { generateToken, randomId } from "@/lib/token";
import { createSignedUploadUrls } from "@/lib/storage";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { files = [], clientEncrypted = false, expiry = 60 * 60 * 24 * 7, maxDownloads = null } = body ?? {};

  const token = generateToken(10);
  const uploadId = randomId();

  const now = Date.now();
  const expiresAt = expiry === null ? null : now + Number(expiry) * 1000;

  const objectPaths = files.map((f: any, idx: number) => ({
    path: `${uploadId}/${idx}-${encodeURIComponent(f?.name || "file")}`,
  }));

  const signedUploadUrls = await createSignedUploadUrls("uploads", objectPaths);

  const presignedUrls = signedUploadUrls.map((s, idx) => ({
    fileIndex: idx,
    url: s.url,
    storageKey: s.path,
  }));

  return NextResponse.json({ uploadId, token, presignedUrls, clientEncrypted, expiresAt, maxDownloads });
}


