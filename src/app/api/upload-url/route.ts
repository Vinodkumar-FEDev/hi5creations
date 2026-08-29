import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB max file size limit

export async function POST(req: Request) {
  try {
    // 1. Verify user is authenticated server-side
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to upload images." },
        { status: 401 }
      );
    }

    // 2. Check R2 environment configuration
    const configCheck = validateR2Config();
    if (!configCheck.valid) {
      console.error("Missing R2 Configuration:", configCheck.missingVars);
      return NextResponse.json(
        {
          error: "Cloudflare R2 is not fully configured on the server.",
          missingConfig: configCheck.missingVars,
        },
        { status: 500 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const { contentType, fileName, title, category, subcategory, fileSize } = body;

    if (!contentType || typeof contentType !== "string") {
      return NextResponse.json(
        { error: "Content-Type is required" },
        { status: 400 }
      );
    }

    const cleanContentType = contentType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.has(cleanContentType)) {
      return NextResponse.json(
        {
          error: `Invalid file type '${contentType}'. Allowed types: ${Array.from(
            ALLOWED_MIME_TYPES
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (fileSize && typeof fileSize === "number" && fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds maximum allowed limit of 20MB." },
        { status: 400 }
      );
    }

    // 4. Determine file extension safely using MIME type
    let extension = "jpg";
    if (cleanContentType.includes("png")) extension = "png";
    else if (cleanContentType.includes("webp")) extension = "webp";
    else if (cleanContentType.includes("gif")) extension = "gif";
    else if (cleanContentType.includes("avif")) extension = "avif";

    // 5. Generate secure object key using crypto.randomUUID()
    const uuid = crypto.randomUUID();
    const userId = session.userId || "admin";
    const objectKey = `users/${userId}/images/${uuid}.${extension}`;

    // 6. Metadata to store with R2 object
    const imageTitle = (title || fileName || "Signage Project").toString().trim();
    const imageCategory = (category || "LED Sign Board").toString().trim();
    const imageSubcategory = (subcategory || "").toString().trim();

    // 7. Create PutObjectCommand for short-lived presigned URL
    const command = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: objectKey,
      ContentType: cleanContentType,
      Metadata: {
        title: encodeURIComponent(imageTitle),
        category: encodeURIComponent(imageCategory),
        subcategory: encodeURIComponent(imageSubcategory),
        uploadedby: userId,
        uploadedat: Date.now().toString(),
      },
    });

    // Generate short-lived presigned PUT URL (60 seconds)
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });

    return NextResponse.json({
      uploadUrl,
      key: objectKey,
      objectKey,
      expiresInSeconds: 60,
      metadata: {
        title: imageTitle,
        category: imageCategory,
        subcategory: imageSubcategory,
        key: objectKey,
      },
    });
  } catch (err: any) {
    console.error("Error generating R2 presigned upload URL:", err);
    return NextResponse.json(
      { error: "Failed to generate presigned upload URL", details: err.message },
      { status: 500 }
    );
  }
}
