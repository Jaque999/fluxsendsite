import { NextRequest, NextResponse } from "next/server";
import { getStoragePath, fileExists, readFile } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path");
    if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

    if (!fileExists(path)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = readFile(path);
    const fileName = path.split("/").pop() || "file";

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

