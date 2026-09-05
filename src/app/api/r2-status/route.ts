import { NextResponse } from "next/server";
import { validateR2Config, getBucketName } from "@/src/lib/r2";

export const dynamic = "force-dynamic";

export async function GET() {
  const configCheck = validateR2Config();
  return NextResponse.json({
    connected: configCheck.valid,
    missingVars: configCheck.missingVars,
    bucketName: configCheck.valid ? getBucketName() : null,
  });
}
