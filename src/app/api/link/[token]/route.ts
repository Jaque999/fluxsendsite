import { NextRequest, NextResponse } from "next/server";
import { hashToken } from "@/lib/token";
import { findByTokenHash, incrementDownload } from "@/lib/store";
import { createSignedDownloadUrls } from "@/lib/storage";

const TOKEN_PEPPER = process.env.TOKEN_PEPPER || "dev-pepper";

export async function GET(_req: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const tokenHash = hashToken(token, TOKEN_PEPPER);
  const rec = await findByTokenHash(tokenHash);
  if (!rec) return NextResponse.json({ valid: false }, { status: 404 });

  const now = Date.now();
  const expired = rec.expiry !== null && now > rec.expiry;
  if (expired) return NextResponse.json({ valid: false, reason: "expired" }, { status: 410 });

  return NextResponse.json({
    valid: true,
    files: rec.files.map((f) => ({ name: f.name, size: f.size })),
    passwordProtected: rec.passwordProtected,
    expiry: rec.expiry,
    remainingDownloads: rec.maxDownloads === null ? null : Math.max(0, rec.maxDownloads - rec.downloadCount),
  });
}

export async function POST(_req: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const tokenHash = hashToken(token, TOKEN_PEPPER);
  const rec = await findByTokenHash(tokenHash);
  if (!rec) return NextResponse.json({ ok: false }, { status: 404 });

  const now = Date.now();
  const expired = rec.expiry !== null && now > rec.expiry;
  if (expired) return NextResponse.json({ ok: false, error: "expired" }, { status: 410 });

  if (rec.maxDownloads !== null && rec.downloadCount >= rec.maxDownloads) {
    return NextResponse.json({ ok: false, error: "max_downloads_reached" }, { status: 429 });
  }

  const signed = await createSignedDownloadUrls(
    "uploads",
    rec.files.map((f) => ({ path: f.storageKey })),
  );

  await incrementDownload(rec.id);

  return NextResponse.json({
    ok: true,
    fileUrls: rec.files.map((f, i) => ({ name: f.name, url: signed[i].url })),
    remainingDownloads: rec.maxDownloads === null ? null : Math.max(0, (rec.maxDownloads - (rec.downloadCount + 1))),
  });
}


