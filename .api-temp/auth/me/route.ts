import { NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (session) {
    return NextResponse.json({ authenticated: true, user: session });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
