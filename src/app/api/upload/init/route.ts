import { NextRequest, NextResponse } from "next/server";
import { generateToken, randomId } from "@/lib/token";
import { createSignedUploadUrls } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { files = [], clientEncrypted = false, expiry = 60 * 60 * 24 * 7, maxDownloads = null } = body ?? {};

  const token = generateToken(10);
  const uploadId = randomId();

  const now = Date.now();
  const expiresAt = expiry === null ? null : now + Number(expiry) * 1000;

  const objectPaths = files.map((f: any, idx: number) => ({
    path: `${uploadId}/${idx}-${encodeURIComponent(f?.name || "file")}`,
  }));

  // Get base URL from request headers
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const proto = (request.headers.get("x-forwarded-proto") || "https").split(",")[0];
  const baseUrl = host ? `${proto}://${host}` : (process.env.BASE_URL || "http://localhost:3000");

  const signedUploadUrls = await createSignedUploadUrls("uploads", objectPaths, baseUrl);

  const presignedUrls = signedUploadUrls.map((s, idx) => ({
    fileIndex: idx,
    url: s.url,
    storageKey: s.path,
  }));

  return NextResponse.json({ uploadId, token, presignedUrls, clientEncrypted, expiresAt, maxDownloads });
}


