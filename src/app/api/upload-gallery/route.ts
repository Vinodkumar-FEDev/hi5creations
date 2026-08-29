import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ASSETS_DIR = path.join(process.cwd(), "public", "assets", "gallery");
const MANIFEST_PATH = path.join(ASSETS_DIR, "gallery-data.json");

function ensureDir() {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }
}

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
  ensureDir();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { newImages } = body;

    if (!Array.isArray(newImages) || newImages.length === 0) {
      return NextResponse.json({ addedCount: 0, images: readManifest() });
    }

    ensureDir();
    let currentImages = readManifest();
    const addedRecords: any[] = [];
    const now = Date.now();

    newImages.forEach((img: any, idx: number) => {
      const id = img.id || `img_${now}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
      let imageDataUrl = img.imageDataUrl || "";
      let fileName = img.fileName;

      if (imageDataUrl.startsWith("data:")) {
        const matches = imageDataUrl.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
        if (matches) {
          let ext = matches[1].toLowerCase();
          if (ext === "jpeg") ext = "jpg";
          if (ext.includes("svg")) ext = "svg";
          if (ext.includes("avif")) ext = "avif";
          if (ext.includes("webp")) ext = "webp";

          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");
          fileName = `${id}.${ext}`;
          const filePath = path.join(ASSETS_DIR, fileName);
          fs.writeFileSync(filePath, buffer);
          imageDataUrl = `/assets/gallery/${fileName}`;
        }
      }

      const record = {
        id,
        title: img.title || "Signage Project",
        category: img.category || "LED Sign Board",
        subcategory: img.subcategory || "",
        imageDataUrl,
        fileName,
        timestamp: now + idx,
      };
      addedRecords.push(record);
    });

    currentImages = [...addedRecords, ...currentImages];
    writeManifest(currentImages);

    return NextResponse.json({
      addedCount: addedRecords.length,
      prunedCount: 0,
      images: currentImages,
    });
  } catch (err) {
    console.error("Error saving uploaded images:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
