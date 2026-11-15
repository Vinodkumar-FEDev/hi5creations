import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getStorageClient, getBucketName, validateStorageConfig, addR2ManifestRecord } from "@/src/lib/s3";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit

export async function POST(req: Request) {
  try {
    const config = validateStorageConfig();
    if (!config.valid) {
      return NextResponse.json(
        { error: "AWS S3 storage is not configured properly in .env.local", missing: config.missingVars },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Signage Project";
    const category = (formData.get("category") as string) || "LED Sign Board";
    const subcategory = (formData.get("subcategory") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No image file received." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds 25MB limit." }, { status: 400 });
    }

    const cleanContentType = (file.type || "image/webp").toLowerCase().trim();
    let extension = "webp";
    if (cleanContentType.includes("jpeg") || cleanContentType.includes("jpg")) extension = "jpg";
    else if (cleanContentType.includes("png")) extension = "png";
    else if (cleanContentType.includes("gif")) extension = "gif";

    const uuid = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const userId = "admin";
    const objectKey = `users/${userId}/images/${uuid}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const client = getStorageClient();
    const bucket = getBucketName();

    const putCmd = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: buffer,
      ContentType: cleanContentType,
      Metadata: {
        title: encodeURIComponent(title.trim()),
        category: encodeURIComponent(category.trim()),
        subcategory: encodeURIComponent(subcategory.trim()),
        uploadedat: Date.now().toString(),
      },
    });

    await client.send(putCmd);

    const region = config.region || "eu-north-1";
    const directUrl = `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;

    // Add to S3 gallery manifest
    await addR2ManifestRecord(userId, {
      id: objectKey,
      key: objectKey,
      title: title.trim(),
      category: category.trim(),
      subcategory: subcategory.trim(),
      url: directUrl,
      imageDataUrl: directUrl,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      key: objectKey,
      url: directUrl,
    });
  } catch (err: any) {
    console.error("Error uploading image directly to S3:", err);
    return NextResponse.json(
      { error: "Failed to upload to AWS S3", details: err.message },
      { status: 500 }
    );
  }
}
