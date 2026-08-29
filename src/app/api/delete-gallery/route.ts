import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ASSETS_DIR = path.join(process.cwd(), "public", "assets", "gallery");
const MANIFEST_PATH = path.join(ASSETS_DIR, "gallery-data.json");

function readManifest() {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const data = fs.readFileSync(MANIFEST_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading gallery manifest:", err);
  }
  return [];
}

function writeManifest(data: any[]) {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ids } = body;
    const targetIds = new Set<string>(Array.isArray(ids) ? ids : id ? [id] : []);
    let currentImages = readManifest();

    currentImages.forEach((item: any) => {
      if (targetIds.has(item.id) && item.fileName) {
        const p = path.join(ASSETS_DIR, item.fileName);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    });

    currentImages = currentImages.filter((item: any) => !targetIds.has(item.id));
    writeManifest(currentImages);

    return NextResponse.json({ success: true, images: currentImages });
  } catch (err) {
    console.error("Error deleting gallery images:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
