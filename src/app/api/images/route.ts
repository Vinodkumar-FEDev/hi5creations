import { NextResponse } from "next/server";
import { DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { r2Client, getBucketName, validateR2Config, deleteR2ManifestRecords } from "@/src/lib/r2";
import { getSession } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  try {
    // 1. Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to delete images." },
        { status: 401 }
      );
    }

    // 2. Validate R2 config
    const configCheck = validateR2Config();
    if (!configCheck.valid) {
      return NextResponse.json(
        { error: "Cloudflare R2 is not configured on the server." },
        { status: 500 }
      );
    }

    // 3. Parse request payload
    const body = await req.json();
    const { key, keys } = body;
    const requestedKeys: string[] = Array.isArray(keys)
      ? keys
      : typeof key === "string"
      ? [key]
      : [];

    if (requestedKeys.length === 0) {
      return NextResponse.json(
        { error: "No image object keys provided for deletion." },
        { status: 400 }
      );
    }

    // 4. Security Check: Enforce user prefix ownership
    const userId = session.userId || "admin";
    const userPrefix = `users/${userId}/images/`;

    const unauthorizedKeys = requestedKeys.filter((k) => !k.startsWith(userPrefix));
    if (unauthorizedKeys.length > 0) {
      return NextResponse.json(
        {
          error: "Forbidden. You can only delete images owned by your account.",
          unauthorizedKeys,
        },
        { status: 403 }
      );
    }

    // 5. Perform deletion on Cloudflare R2
    if (requestedKeys.length === 1) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: getBucketName(),
        Key: requestedKeys[0],
      });
      await r2Client.send(deleteCommand);
    } else {
      const deleteObjectsCommand = new DeleteObjectsCommand({
        Bucket: getBucketName(),
        Delete: {
          Objects: requestedKeys.map((k) => ({ Key: k })),
          Quiet: true,
        },
      });
      await r2Client.send(deleteObjectsCommand);
    }

    // Sync R2 index manifest deletion
    await deleteR2ManifestRecords(userId, requestedKeys);

    return NextResponse.json({
      success: true,
      deletedCount: requestedKeys.length,
      deletedKeys: requestedKeys,
    });
  } catch (err: any) {
    console.error("Error deleting image(s) from Cloudflare R2:", err);
    return NextResponse.json(
      { error: "Failed to delete image from storage", details: err.message },
      { status: 500 }
    );
  }
}
