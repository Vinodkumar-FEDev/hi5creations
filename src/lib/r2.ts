import "server-only";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Validates that all required Cloudflare R2 environment variables are populated with actual credentials.
 */
export function validateR2Config(): { valid: boolean; missingVars: string[] } {
  const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();
  const bucketName = (process.env.R2_BUCKET_NAME || "").trim();

  const missingVars: string[] = [];
  if (!accountId || accountId.includes("your_") || accountId === "") missingVars.push("R2_ACCOUNT_ID");
  if (!accessKeyId || accessKeyId.includes("your_") || accessKeyId === "") missingVars.push("R2_ACCESS_KEY_ID");
  if (!secretAccessKey || secretAccessKey.includes("your_") || secretAccessKey === "") missingVars.push("R2_SECRET_ACCESS_KEY");
  if (!bucketName || bucketName.includes("your_") || bucketName === "") missingVars.push("R2_BUCKET_NAME");

  return {
    valid: missingVars.length === 0,
    missingVars,
  };
}

export function getBucketName(): string {
  return (process.env.R2_BUCKET_NAME || "").trim();
}

/**
 * Dynamically constructs the server-only Cloudflare R2 S3 Client using active process environment variables.
 */
export function getR2Client(): S3Client {
  const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export const r2Client = new Proxy({} as S3Client, {
  get(_target, prop) {
    const client = getR2Client();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export const BUCKET_NAME = getBucketName();

/**
 * Reads gallery index manifest from R2
 */
export async function readR2Manifest(userId = "admin"): Promise<any[]> {
  try {
    const manifestKey = `users/${userId}/gallery-manifest.json`;
    const cmd = new GetObjectCommand({ Bucket: getBucketName(), Key: manifestKey });
    const res = await r2Client.send(cmd);
    const bodyStr = await res.Body?.transformToString();
    if (bodyStr) {
      const parsed = JSON.parse(bodyStr);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore if manifest does not exist
  }
  return [];
}

/**
 * Writes gallery index manifest to R2
 */
export async function writeR2Manifest(userId = "admin", items: any[]): Promise<boolean> {
  try {
    const manifestKey = `users/${userId}/gallery-manifest.json`;
    const cmd = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: manifestKey,
      Body: JSON.stringify(items, null, 2),
      ContentType: "application/json",
    });
    await r2Client.send(cmd);
    return true;
  } catch (err) {
    console.error("Error writing R2 gallery manifest:", err);
    return false;
  }
}

/**
 * Adds a new record to the R2 gallery manifest
 */
export async function addR2ManifestRecord(userId = "admin", record: any): Promise<boolean> {
  const current = await readR2Manifest(userId);
  const targetKey = record.key || record.id;
  const filtered = current.filter((item) => {
    const itemKey = item.key || item.id;
    return itemKey !== targetKey;
  });
  const updated = [record, ...filtered];
  return await writeR2Manifest(userId, updated);
}

/**
 * Deletes records by keys from the R2 gallery manifest
 */
export async function deleteR2ManifestRecords(userId = "admin", keys: string[]): Promise<boolean> {
  const targetKeys = new Set(keys);
  const current = await readR2Manifest(userId);
  const updated = current.filter((item) => !targetKeys.has(item.key) && !targetKeys.has(item.id));
  return await writeR2Manifest(userId, updated);
}
