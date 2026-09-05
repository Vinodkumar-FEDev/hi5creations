import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, getBucketName, validateR2Config, addR2ManifestRecord } from "@/src/lib/r2";
import { getSession } from "@/src/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ASSETS_DIR = path.join(process.cwd(), "public", "assets", "gallery");
const MANIFEST_PATH = path.join(ASSETS_DIR, "gallery-data.json");

function ensureDir() {
  try {
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }
  } catch (err) {
    // Ignore in read-only environment
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
  try {
    ensureDir();
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Unable to write local manifest (read-only filesystem):", err);
  }
}

export async function POST(req: Request) {
  try {
    // Session check for security
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to upload images." },
        { status: 401 }
      );
    }

    const userId = session.userId || "admin";
    const body = await req.json();
    const { newImages } = body;

    if (!Array.isArray(newImages) || newImages.length === 0) {
      return NextResponse.json({ addedCount: 0, images: [] });
    }

    const r2Config = validateR2Config();

    // If Cloudflare R2 is configured, upload directly to R2 cloud storage
    if (r2Config.valid) {
      const addedRecords: any[] = [];
      const now = Date.now();

      for (let idx = 0; idx < newImages.length; idx++) {
        const img = newImages[idx];
        const imageDataUrl = img.imageDataUrl || "";
        let contentType = "image/jpeg";
        let ext = "jpg";
        let buffer: Buffer | null = null;

        if (imageDataUrl.startsWith("data:")) {
          const matches = imageDataUrl.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
          if (matches) {
            let typeExt = matches[1].toLowerCase();
            if (typeExt === "jpeg") typeExt = "jpg";
            if (typeExt.includes("png")) { ext = "png"; contentType = "image/png"; }
            else if (typeExt.includes("webp")) { ext = "webp"; contentType = "image/webp"; }
            else if (typeExt.includes("avif")) { ext = "avif"; contentType = "image/avif"; }
            else { ext = "jpg"; contentType = "image/jpeg"; }

            buffer = Buffer.from(matches[2], "base64");
          }
        }

        if (buffer) {
          const uuid = crypto.randomUUID();
          const objectKey = `users/${userId}/images/${uuid}.${ext}`;
          const title = (img.title || "Signage Project").trim();
          const category = (img.category || "LED Sign Board").trim();
          const subcategory = (img.subcategory || "").trim();

          const command = new PutObjectCommand({
            Bucket: getBucketName(),
            Key: objectKey,
            Body: buffer,
            ContentType: contentType,
            Metadata: {
              title: encodeURIComponent(title),
              category: encodeURIComponent(category),
              subcategory: encodeURIComponent(subcategory),
              uploadedby: userId,
              uploadedat: (now + idx).toString(),
            },
          });

          await r2Client.send(command);

          const record = {
            id: objectKey,
            key: objectKey,
            title,
            category,
            subcategory,
            timestamp: now + idx,
          };

          await addR2ManifestRecord(userId, record);
          addedRecords.push(record);
        }
      }

      return NextResponse.json({
        success: true,
        addedCount: addedRecords.length,
        images: addedRecords,
      });
    }

    // Fallback: local disk write (works in dev or server with writable disk)
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

          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");
          fileName = `${id}.${ext}`;
          const filePath = path.join(ASSETS_DIR, fileName);
          try {
            ensureDir();
            fs.writeFileSync(filePath, buffer);
            imageDataUrl = `/assets/gallery/${fileName}`;
          } catch (err) {
            console.error("Failed to write image file locally:", err);
          }
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
      images: currentImages,
    });
  } catch (err: any) {
    console.error("Error saving uploaded images:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
