import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}

export async function GET() {
  await clearSessionCookie();
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
