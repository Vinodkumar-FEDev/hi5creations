import { NextResponse } from "next/server";
import { validateR2Config, getBucketName } from "@/src/lib/r2";

export const dynamic = "force-dynamic";

export async function GET() {
  const configCheck = validateR2Config();
  return NextResponse.json({
    connected: configCheck.valid,
    missingVars: configCheck.missingVars,
    bucketName: configCheck.valid ? getBucketName() : null,
    environment: process.env.VERCEL ? "vercel" : "development",
    instructions: configCheck.valid
      ? "Cloudflare R2 is fully connected and ready."
      : "Cloudflare R2 environment variables are missing. If hosting on Vercel, please add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and SESSION_SECRET in Vercel Project Settings → Environment Variables and redeploy.",
  });
}
