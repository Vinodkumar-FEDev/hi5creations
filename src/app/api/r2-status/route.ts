export const dynamic = "force-static";

export async function GET() {
  const hasAws = Boolean(
    (process.env.AWS_ACCESS_KEY_ID || process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID) &&
    (process.env.AWS_BUCKET_NAME || process.env.NEXT_PUBLIC_AWS_BUCKET_NAME)
  );
  const hasR2 = Boolean(
    process.env.R2_ACCOUNT_ID &&
    (process.env.R2_BUCKET_NAME || process.env.NEXT_PUBLIC_R2_BUCKET_NAME)
  );

  if (hasAws) {
    return Response.json({
      connected: true,
      provider: "AWS S3",
      providerType: "s3",
      bucketName: process.env.AWS_BUCKET_NAME || process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || "hi5creation",
      region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || "eu-north-1",
      missingVars: [],
      environment: process.env.NODE_ENV,
    });
  }

  if (hasR2) {
    return Response.json({
      connected: true,
      provider: "Cloudflare R2",
      providerType: "r2",
      bucketName: process.env.R2_BUCKET_NAME || process.env.NEXT_PUBLIC_R2_BUCKET_NAME || "hi5creations",
      missingVars: [],
      environment: process.env.NODE_ENV,
    });
  }

  return Response.json({
    connected: true,
    provider: "Local Storage",
    providerType: "local",
    bucketName: "hi5-local-storage",
    missingVars: [],
    environment: process.env.NODE_ENV,
  });
}
