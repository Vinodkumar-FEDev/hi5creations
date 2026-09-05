import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { validateR2Config, deleteR2ManifestRecords } from "@/src/lib/r2";
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
  try {
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Unable to update local manifest (read-only filesystem):", err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to delete images." },
        { status: 401 }
      );
    }

    const userId = session.userId || "admin";
    const body = await req.json();
    const { id, ids } = body;
    const targetIds = new Set<string>(Array.isArray(ids) ? ids : id ? [id] : []);

    const r2Config = validateR2Config();
    if (r2Config.valid) {
      const r2Keys = Array.from(targetIds);
      await deleteR2ManifestRecords(userId, r2Keys);
    }

    let currentImages = readManifest();

    currentImages.forEach((item: any) => {
      if (targetIds.has(item.id) && item.fileName) {
        const p = path.join(ASSETS_DIR, item.fileName);
        try {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        } catch {}
      }
    });

    currentImages = currentImages.filter((item: any) => !targetIds.has(item.id));
    writeManifest(currentImages);

    return NextResponse.json({ success: true, images: currentImages });
  } catch (err: any) {
    console.error("Error deleting gallery images:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
