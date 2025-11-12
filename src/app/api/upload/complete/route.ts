import { NextResponse } from "next/server";
import { hashToken } from "@/lib/token";
import { putUpload } from "@/lib/store";

const TOKEN_PEPPER = process.env.TOKEN_PEPPER || "dev-pepper";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { uploadId, token, filesMeta = [], clientEncrypted = false, expiresAt = null, maxDownloads = null, passwordProtected = false } = body ?? {};

  if (!uploadId || !token) return NextResponse.json({ ok: false, error: "missing uploadId or token" }, { status: 400 });

  const tokenHash = hashToken(token, TOKEN_PEPPER);

  await putUpload({
    id: uploadId,
    tokenHash,
    files: filesMeta,
    expiry: expiresAt,
    maxDownloads,
    downloadCount: 0,
    passwordProtected: Boolean(passwordProtected),
    clientEncrypted: Boolean(clientEncrypted),
    createdAt: Date.now(),
  });

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const proto = (request.headers.get("x-forwarded-proto") || "https").split(",")[0];
  const base = host ? `${proto}://${host}` : "";
  const publicLink = `${base}/t/${token}`;
  return NextResponse.json({ ok: true, publicLink });
}


