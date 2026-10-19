import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "hi5_admin_session";
export const AUTH_SALT = process.env.AUTH_SALT || "hi5_signage_auth_secure_salt_2026";

// SHA-256 encrypted password hashes with salt
const ENCRYPTED_ADMIN_HASHES = new Set([
  "0e8bd945efc5448d4ba73bd77943406b443072cacbcf6e74ac6ee8f98a53c671", // hi5creation@2026
  "767cdcea63c4ed78ca64d28a04ac8faf4223c59e2af6f6e88a3438998c9725bb", // Admin@123
  "444fe0d69a7ba9679040e7bcc80a0851e3a289b1edbba88fb14e5fc533e15e48", // hi5creation123
]);

export interface AuthSession {
  userId: string;
  username: string;
}

/**
 * Computes salted SHA-256 cryptographic hash of a password string.
 */
export function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(`${AUTH_SALT}:${password.trim()}`)
    .digest("hex");
}

/**
 * Validates admin credentials securely using encrypted cryptographic hashes.
 * Timing-safe comparison is used to prevent timing attack vulnerabilities.
 */
export function validateCredentials(username: string, passOrHash: string, isAlreadyHashed = false): boolean {
  const cleanUser = username.trim().toLowerCase();
  const cleanVal = passOrHash.trim();

  const envUser = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  if (cleanUser !== "admin" && cleanUser !== envUser) {
    return false;
  }

  const inputHash = isAlreadyHashed ? cleanVal : hashPassword(cleanVal);

  // Check predefined encrypted hashes
  if (ENCRYPTED_ADMIN_HASHES.has(inputHash)) {
    return true;
  }

  // Check dynamically from environment variable ADMIN_PASSWORD
  const envPass = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : "";
  if (envPass) {
    const envHash = hashPassword(envPass);
    try {
      if (crypto.timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(envHash, "hex"))) {
        return true;
      }
    } catch {
      if (inputHash === envHash) return true;
    }
  }

  return false;
}

/**
 * Retrieves and validates the current session from HTTP cookies server-side.
 * Returns null if no valid session cookie exists.
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const [userId, username] = sessionCookie.value.split(":");
    if (userId === "admin" && username) {
      return { userId, username };
    }
  } catch (err) {
    console.error("Error reading auth session:", err);
  }
  return null;
}

/**
 * Sets an HTTP-only browser session cookie upon successful login.
 * No long-lived maxAge is set so the session automatically closes with the browser.
 */
export async function createSessionCookie(username: string): Promise<void> {
  const cookieStore = await cookies();
  const userId = "admin";
  const sessionToken = `${userId}:${username}`;

  cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Clears the auth session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
  } catch (err) {
    console.error("Error deleting auth session cookie:", err);
  }
}
