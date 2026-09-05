import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { validateR2Config, writeR2Manifest } from "@/src/lib/r2";
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
    console.warn("Unable to clear local manifest (read-only filesystem):", err);
  }
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to clear gallery." },
        { status: 401 }
      );
    }

    const userId = session.userId || "admin";
    const r2Config = validateR2Config();
    if (r2Config.valid) {
      await writeR2Manifest(userId, []);
    }

    const currentImages = readManifest();
    currentImages.forEach((item: any) => {
      if (item.fileName) {
        const p = path.join(ASSETS_DIR, item.fileName);
        try {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        } catch {}
      }
    });

    writeManifest([]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error clearing gallery images:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
