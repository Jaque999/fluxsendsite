import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { getStoragePath } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path");
    if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const storagePath = getStoragePath(path);
    const dir = dirname(storagePath);
    mkdirSync(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(storagePath, buffer);

    return NextResponse.json({ ok: true, path });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

