import { NextResponse } from "next/server";
import { addR2ManifestRecord, getBucketName, validateStorageConfig } from "@/src/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, title = "Signage Project", category = "LED Sign Board", subcategory = "" } = body;

    if (!key) {
      return NextResponse.json({ error: "Missing object key" }, { status: 400 });
    }

    const config = validateStorageConfig();
    const bucket = getBucketName();
    const region = config.region || "eu-north-1";
    const directUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    await addR2ManifestRecord("admin", {
      id: key,
      key,
      title: String(title).trim(),
      category: String(category).trim(),
      subcategory: String(subcategory).trim(),
      url: directUrl,
      imageDataUrl: directUrl,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true, key, url: directUrl });
  } catch (err: any) {
    console.error("Error confirming upload:", err);
    return NextResponse.json({ error: "Failed to confirm upload", details: err.message }, { status: 500 });
  }
}
