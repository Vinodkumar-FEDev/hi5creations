import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getStorageClient, getBucketName, validateStorageConfig } from "@/src/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const config = validateStorageConfig();
    if (!config.valid) {
      return NextResponse.json(
        { error: "AWS S3 storage is not configured properly in .env.local" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { contentType = "image/webp", title = "Signage Project", category = "LED Sign Board", subcategory = "" } = body;

    let extension = "webp";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) extension = "jpg";
    else if (contentType.includes("png")) extension = "png";

    const uuid = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const userId = "admin";
    const objectKey = `users/${userId}/images/${uuid}.${extension}`;

    const client = getStorageClient();
    const bucket = getBucketName();

    const putCmd = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: contentType,
      Metadata: {
        title: encodeURIComponent(String(title).trim()),
        category: encodeURIComponent(String(category).trim()),
        subcategory: encodeURIComponent(String(subcategory).trim()),
        uploadedat: Date.now().toString(),
      },
    });

    const uploadUrl = await getSignedUrl(client, putCmd, { expiresIn: 900 });
    const region = config.region || "eu-north-1";
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;

    return NextResponse.json({
      uploadUrl,
      key: objectKey,
      publicUrl,
    });
  } catch (err: any) {
    console.error("Error generating presigned upload URL:", err);
    return NextResponse.json({ error: "Failed to generate upload URL", details: err.message }, { status: 500 });
  }
}
