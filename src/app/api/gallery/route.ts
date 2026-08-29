import { NextResponse } from "next/server";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, getBucketName, validateR2Config } from "@/src/lib/r2";
import { getSession } from "@/src/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const LOCAL_ASSETS_DIR = path.join(process.cwd(), "public", "assets", "gallery");
const LOCAL_MANIFEST_PATH = path.join(LOCAL_ASSETS_DIR, "gallery-data.json");

function readLocalManifest() {
  try {
    if (fs.existsSync(LOCAL_MANIFEST_PATH)) {
      const data = fs.readFileSync(LOCAL_MANIFEST_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Error reading local gallery manifest:", err);
  }
  return [];
}

function deduplicateGalleryItems(items: any[]): any[] {
  const seenKeys = new Set<string>();
  return items.filter((item) => {
    if (!item) return false;
    const identifier = item.key || item.id || item.url;
    if (!identifier || seenKeys.has(identifier)) {
      return false;
    }
    seenKeys.add(identifier);
    return true;
  });
}

export async function GET() {
  const configCheck = validateR2Config();

  // If R2 is not fully configured, return local manifest fallback immediately
  if (!configCheck.valid) {
    const localImages = readLocalManifest();
    return NextResponse.json(localImages);
  }

  try {
    const session = await getSession();
    const userId = session?.userId || "admin";
    const manifestKey = `users/${userId}/gallery-manifest.json`;
    let manifestItems: any[] = [];

    // 1. Fast path: Fetch single manifest JSON from Cloudflare R2
    try {
      const getManifestCmd = new GetObjectCommand({
        Bucket: getBucketName(),
        Key: manifestKey,
      });
      const manifestRes = await r2Client.send(getManifestCmd);
      const manifestBody = await manifestRes.Body?.transformToString();
      if (manifestBody) {
        manifestItems = JSON.parse(manifestBody);
      }
    } catch {
      // Manifest file does not exist yet on R2
    }

    // 2. If manifest was found, generate presigned GET URLs instantly
    if (Array.isArray(manifestItems) && manifestItems.length > 0) {
      const imagesPromises = manifestItems.map(async (item) => {
        const itemKey = item.key || item.id;
        if (!itemKey) return null;

        let presignedUrl = item.imageDataUrl || item.url || "";
        if (itemKey.startsWith("users/")) {
          try {
            const getCmd = new GetObjectCommand({
              Bucket: getBucketName(),
              Key: itemKey,
            });
            presignedUrl = await getSignedUrl(r2Client, getCmd, { expiresIn: 3600 });
          } catch {
            // Keep existing URL if presigning fails
          }
        }

        return {
          id: itemKey,
          key: itemKey,
          title: item.title || "Signage Project",
          category: item.category || "LED Sign Board",
          subcategory: item.subcategory || "",
          url: presignedUrl,
          imageDataUrl: presignedUrl,
          timestamp: item.timestamp || Date.now(),
        };
      });

      const images = (await Promise.all(imagesPromises)).filter(Boolean);
      const uniqueImages = deduplicateGalleryItems(images);
      return NextResponse.json(uniqueImages);
    }

    // 3. Fallback path: ListObjectsV2 with fast check
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: getBucketName(),
        Prefix: `users/${userId}/images/`,
      });

      const listResult = await r2Client.send(listCommand);
      const objects = listResult.Contents || [];

      if (objects.length === 0) {
        const localImages = readLocalManifest();
        return NextResponse.json(localImages);
      }

      objects.sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0));

      const imagesPromises = objects.map(async (obj) => {
        if (!obj.Key || obj.Key.endsWith("gallery-manifest.json")) return null;

        const getCommand = new GetObjectCommand({
          Bucket: getBucketName(),
          Key: obj.Key,
        });

        const presignedUrl = await getSignedUrl(r2Client, getCommand, { expiresIn: 3600 });
        const filename = obj.Key.split("/").pop() || "";
        const title = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

        return {
          id: obj.Key,
          key: obj.Key,
          title: title || "Signage Project",
          category: "LED Sign Board",
          subcategory: "",
          url: presignedUrl,
          imageDataUrl: presignedUrl,
          timestamp: obj.LastModified?.getTime() || Date.now(),
        };
      });

      const images = (await Promise.all(imagesPromises)).filter(Boolean);
      const uniqueImages = deduplicateGalleryItems(images);
      return NextResponse.json(uniqueImages);
    } catch {
      const localImages = readLocalManifest();
      return NextResponse.json(localImages);
    }
  } catch (err: any) {
    console.error("Error fetching images from Cloudflare R2:", err);
    const localImages = readLocalManifest();
    return NextResponse.json(localImages);
  }
}
