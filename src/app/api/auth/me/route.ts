import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (session) {
    return NextResponse.json({ authenticated: true, user: session });
  }
  return NextResponse.json({ authenticated: false });
}
