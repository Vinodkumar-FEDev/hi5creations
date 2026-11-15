import { NextResponse } from "next/server";
import { deleteS3Objects, deleteR2ManifestRecords } from "@/src/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, ids } = body;
    const requestedKeys: string[] = Array.isArray(ids)
      ? ids
      : typeof id === "string"
      ? [id]
      : [];

    if (requestedKeys.length === 0) {
      return NextResponse.json({ error: "No ids provided." }, { status: 400 });
    }

    const s3Keys = requestedKeys.filter((k) => typeof k === "string" && (k.startsWith("users/") || k.includes("/")));
    if (s3Keys.length > 0) {
      await deleteS3Objects(s3Keys);
      await deleteR2ManifestRecords("admin", s3Keys);
    }

    return NextResponse.json({ success: true, deletedCount: requestedKeys.length });
  } catch (err: any) {
    console.error("Error in delete-gallery route:", err);
    return NextResponse.json({ error: "Failed to delete", details: err.message }, { status: 500 });
  }
}
