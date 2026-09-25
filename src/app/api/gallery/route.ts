import { NextResponse } from "next/server";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getStorageClient, getBucketName, validateStorageConfig } from "@/src/lib/s3";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const LOCAL_MANIFEST_PATH = path.join(process.cwd(), "public", "assets", "gallery", "gallery-data.json");

function readLocalFallback(): any[] {
  try {
    if (fs.existsSync(LOCAL_MANIFEST_PATH)) {
      const data = fs.readFileSync(LOCAL_MANIFEST_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
}

export async function GET() {
  const config = validateStorageConfig();

  // If storage credentials are not valid, return local fallback
  if (!config.valid) {
    return NextResponse.json(readLocalFallback());
  }

  const client = getStorageClient();
  const bucket = getBucketName();
  const userId = "admin";
  const manifestKey = `users/${userId}/gallery-manifest.json`;

  try {
    // 1. Primary: Read S3 gallery manifest
    let manifestItems: any[] = [];
    try {
      const cmd = new GetObjectCommand({ Bucket: bucket, Key: manifestKey });
      const res = await client.send(cmd);
      const text = await res.Body?.transformToString();
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          manifestItems = parsed;
        }
      }
    } catch {
      // Manifest does not exist yet on S3
    }

    if (manifestItems.length > 0) {
      const region = config.region || "eu-north-1";
      const processed = await Promise.all(
        manifestItems.map(async (item) => {
          const itemKey = item.key || item.id;
          if (!itemKey) return null;

          // Standard direct public S3 URL
          let url = `https://${bucket}.s3.${region}.amazonaws.com/${itemKey}`;

          // Also generate presigned GET URL (7 days expiration) as fallback
          try {
            const getCmd = new GetObjectCommand({ Bucket: bucket, Key: itemKey });
            url = await getSignedUrl(client, getCmd, { expiresIn: 604800 });
          } catch (_) {}

          return {
            id: itemKey,
            key: itemKey,
            title: item.title || "Signage Project",
            category: item.category || "LED Sign Board",
            subcategory: item.subcategory || "",
            url,
            imageDataUrl: url,
            timestamp: item.timestamp || Date.now(),
          };
        })
      );

      const validItems = processed.filter((item): item is NonNullable<typeof item> => Boolean(item));
      // Newest first
      validItems.sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
      return NextResponse.json(validItems);
    }

    // 2. Fallback: Scan S3 folder users/admin/images/
    try {
      const listCmd = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: `users/${userId}/images/`,
      });
      const listRes = await client.send(listCmd);
      const objects = listRes.Contents || [];

      if (objects.length > 0) {
        const region = config.region || "eu-north-1";
        const scanned = await Promise.all(
          objects.map(async (obj) => {
            if (!obj.Key || obj.Key.endsWith("gallery-manifest.json")) return null;

            let url = `https://${bucket}.s3.${region}.amazonaws.com/${obj.Key}`;
            try {
              const getCmd = new GetObjectCommand({ Bucket: bucket, Key: obj.Key });
              url = await getSignedUrl(client, getCmd, { expiresIn: 604800 });
            } catch (_) {}

            const filename = obj.Key.split("/").pop() || "";
            const title = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

            return {
              id: obj.Key,
              key: obj.Key,
              title: title || "Signage Project",
              category: "LED Sign Board",
              subcategory: "",
              url,
              imageDataUrl: url,
              timestamp: obj.LastModified?.getTime() || Date.now(),
            };
          })
        );

        const validScanned = scanned.filter((item): item is NonNullable<typeof item> => Boolean(item));
        validScanned.sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
        return NextResponse.json(validScanned);
      }
    } catch (_) {}

    // Fallback to local gallery data
    return NextResponse.json(readLocalFallback());
  } catch (err: any) {
    console.error("Error in GET /api/gallery:", err);
    return NextResponse.json(readLocalFallback());
  }
}
