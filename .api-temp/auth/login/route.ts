import { NextResponse } from "next/server";
import { validateCredentials, createSessionCookie } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password, passwordHash } = await req.json();

    if (!username || (!password && !passwordHash)) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const isValid = passwordHash
      ? validateCredentials(username, passwordHash, true)
      : validateCredentials(username, password, false);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    await createSessionCookie(username);

    return NextResponse.json({
      success: true,
      user: { username, role: "admin" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Login failed.", details: err.message },
      { status: 500 }
    );
  }
}
