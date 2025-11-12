import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { files, password, expiresInMinutes } = body ?? {};

  // TODO: Integrate real storage (S3/Supabase) and encryption
  const id = Math.random().toString(36).slice(2, 8);
  const link = `https://fluxsend.online/${id}`;

  return NextResponse.json({
    ok: true,
    link,
    meta: { count: Array.isArray(files) ? files.length : 0, password: !!password, expiresInMinutes: expiresInMinutes ?? 60 },
  });
}


