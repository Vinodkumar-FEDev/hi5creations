import { NextResponse } from "next/server";
import { validateCredentials, createSessionCookie } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (validateCredentials(username, password)) {
      await createSessionCookie(username);
      return NextResponse.json({
        success: true,
        user: { username, userId: "admin" },
      });
    }

    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error during login" },
      { status: 500 }
    );
  }
}
