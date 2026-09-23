import { NextResponse } from "next/server";
import { validateStorageConfig } from "@/src/lib/r2";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = validateStorageConfig();
  const providerLabel = config.provider;

  return NextResponse.json({
    connected: config.valid,
    provider: providerLabel,
    providerType: config.providerType,
    missingVars: config.missingVars,
    bucketName: config.valid ? config.bucketName : null,
    environment: process.env.VERCEL ? "vercel" : process.env.NODE_ENV || "production",
    instructions: config.valid
      ? `${providerLabel} storage is fully connected and ready.`
      : `${providerLabel} environment variables are missing. Configure AWS S3 (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME) or Cloudflare R2 (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME) along with SESSION_SECRET in your .env.local or host settings.`,
  });
}

