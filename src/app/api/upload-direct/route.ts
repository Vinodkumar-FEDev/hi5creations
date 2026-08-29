import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, getBucketName, validateR2Config, addR2ManifestRecord } from "@/src/lib/r2";
import { getSession } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB limit

export async function POST(req: Request) {
  try {
    // 1. Verify user authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to upload images." },
        { status: 401 }
      );
    }

    // 2. Validate R2 credentials
    const configCheck = validateR2Config();
    if (!configCheck.valid) {
      return NextResponse.json(
        {
          error: "Cloudflare R2 is not fully configured in .env.local.",
          missingConfig: configCheck.missingVars,
        },
        { status: 400 }
      );
    }

    // 3. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Signage Project";
    const category = (formData.get("category") as string) || "LED Sign Board";
    const subcategory = (formData.get("subcategory") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    const cleanContentType = (file.type || "image/jpeg").toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.has(cleanContentType)) {
      return NextResponse.json(
        { error: `Invalid image format '${cleanContentType}'.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds 20MB limit." },
        { status: 400 }
      );
    }

    // 4. Determine extension & generate key
    let extension = "jpg";
    if (cleanContentType.includes("png")) extension = "png";
    else if (cleanContentType.includes("webp")) extension = "webp";
    else if (cleanContentType.includes("gif")) extension = "gif";
    else if (cleanContentType.includes("avif")) extension = "avif";

    const uuid = crypto.randomUUID();
    const userId = session.userId || "admin";
    const objectKey = `users/${userId}/images/${uuid}.${extension}`;

    // 5. Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Upload directly to R2 via S3 SDK
    const command = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: objectKey,
      Body: buffer,
      ContentType: cleanContentType,
      Metadata: {
        title: encodeURIComponent(title.trim()),
        category: encodeURIComponent(category.trim()),
        subcategory: encodeURIComponent(subcategory.trim()),
        uploadedby: userId,
        uploadedat: Date.now().toString(),
      },
    });

    await r2Client.send(command);

    // Sync R2 index manifest
    await addR2ManifestRecord(userId, {
      id: objectKey,
      key: objectKey,
      title: title.trim(),
      category: category.trim(),
      subcategory: subcategory.trim(),
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      key: objectKey,
      objectKey,
    });
  } catch (err: any) {
    console.error("Server direct R2 upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload file to Cloudflare R2", details: err.message },
      { status: 500 }
    );
  }
}
