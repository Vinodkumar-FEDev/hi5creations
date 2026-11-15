import { NextResponse } from "next/server";
import { deleteS3Objects, deleteR2ManifestRecords, validateStorageConfig } from "@/src/lib/s3";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  try {
    const config = validateStorageConfig();
    if (!config.valid) {
      return NextResponse.json({ error: "Storage not configured." }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { key, keys } = body;
    const requestedKeys: string[] = Array.isArray(keys)
      ? keys
      : typeof key === "string"
      ? [key]
      : [];

    if (requestedKeys.length === 0) {
      return NextResponse.json({ error: "No image keys provided for deletion." }, { status: 400 });
    }

    // Filter to keys stored in S3
    const s3Keys = requestedKeys.filter((k) => typeof k === "string" && (k.startsWith("users/") || k.includes("/")));
    const userId = "admin";

    if (s3Keys.length > 0) {
      await deleteS3Objects(s3Keys);
      await deleteR2ManifestRecords(userId, s3Keys);
    }

    return NextResponse.json({
      success: true,
      deletedCount: requestedKeys.length,
      deletedKeys: requestedKeys,
    });
  } catch (err: any) {
    console.error("Error deleting image(s) from S3:", err);
    return NextResponse.json({ error: "Failed to delete from S3", details: err.message }, { status: 500 });
  }
}
