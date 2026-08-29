import { NextResponse } from "next/server";
import { addR2ManifestRecord } from "@/src/lib/r2";
import { getSession } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.userId || "admin";

    const body = await req.json();
    const { key, title, category, subcategory } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Object key is required" }, { status: 400 });
    }

    await addR2ManifestRecord(userId, {
      id: key,
      key,
      title: (title || "Signage Project").trim(),
      category: (category || "LED Sign Board").trim(),
      subcategory: (subcategory || "").trim(),
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true, key });
  } catch (err: any) {
    console.error("Error confirming R2 upload:", err);
    return NextResponse.json({ error: "Failed to confirm upload manifest record" }, { status: 500 });
  }
}
