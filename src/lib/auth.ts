import "server-only";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "hi5_admin_session";

export interface AuthSession {
  userId: string;
  username: string;
}

/**
 * Validates admin credentials server-side.
 * Default admin username: "admin"
 * Accepted passwords: "Admin@123" or "hi5creation123"
 */
export function validateCredentials(username: string, pass: string): boolean {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = pass.trim();
  return (
    cleanUser === "admin" &&
    (cleanPass === "Admin@123" || cleanPass === "hi5creation123")
  );
}

/**
 * Retrieves and validates the current session from HTTP cookies server-side.
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    // Basic token validation (userId:username)
    const [userId, username] = sessionCookie.value.split(":");
    if (userId && username) {
      return { userId, username };
    }
  } catch (err) {
    console.error("Error reading auth session:", err);
  }
  return null;
}

/**
 * Sets an HTTP-only, secure auth session cookie upon successful login.
 */
export async function createSessionCookie(username: string): Promise<void> {
  const cookieStore = await cookies();
  const userId = "admin"; // Derived user ID for multi-tenant path hierarchy: users/{userId}/images/...
  const sessionToken = `${userId}:${username}`;

  cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clears the auth session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
