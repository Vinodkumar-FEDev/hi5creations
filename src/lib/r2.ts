import "server-only";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export function cleanEnvVar(val: string | undefined): string {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "");
}

export type StorageProviderType = "s3" | "r2" | "none";

/**
 * Detects whether to use AWS S3 or Cloudflare R2 based on environment variables.
 */
export function getStorageProvider(): StorageProviderType {
  const explicit = cleanEnvVar(process.env.STORAGE_PROVIDER).toLowerCase();
  if (explicit === "s3" || explicit === "aws") return "s3";
  if (explicit === "r2" || explicit === "cloudflare") return "r2";

  // Check if AWS S3 credentials are provided
  const awsKey = cleanEnvVar(process.env.AWS_ACCESS_KEY_ID);
  const awsSecret = cleanEnvVar(process.env.AWS_SECRET_ACCESS_KEY);
  const awsBucket = cleanEnvVar(
    process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME
  );
  if (awsKey && !awsKey.includes("your_") && awsSecret && !awsSecret.includes("your_") && awsBucket) {
    return "s3";
  }

  // Check if Cloudflare R2 credentials are provided
  const r2Account = cleanEnvVar(process.env.R2_ACCOUNT_ID);
  const r2Key = cleanEnvVar(process.env.R2_ACCESS_KEY_ID);
  const r2Secret = cleanEnvVar(process.env.R2_SECRET_ACCESS_KEY);
  const r2Bucket = cleanEnvVar(process.env.R2_BUCKET_NAME);
  if (r2Account && !r2Account.includes("your_") && r2Key && !r2Key.includes("your_") && r2Secret && r2Bucket) {
    return "r2";
  }

  // If user provided partial AWS keys, assume AWS S3
  if (awsKey || awsBucket) return "s3";

  return "r2";
}

/**
 * Validates configuration for active storage provider (AWS S3 or Cloudflare R2).
 */
export function validateStorageConfig(): {
  valid: boolean;
  provider: "AWS S3" | "Cloudflare R2";
  providerType: StorageProviderType;
  missingVars: string[];
  bucketName: string;
} {
  const provider = getStorageProvider();

  if (provider === "s3") {
    const accessKeyId = cleanEnvVar(process.env.AWS_ACCESS_KEY_ID);
    const secretAccessKey = cleanEnvVar(process.env.AWS_SECRET_ACCESS_KEY);
    const bucketName = cleanEnvVar(
      process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME
    );

    const missingVars: string[] = [];
    if (!accessKeyId || accessKeyId.includes("your_") || accessKeyId === "") missingVars.push("AWS_ACCESS_KEY_ID");
    if (!secretAccessKey || secretAccessKey.includes("your_") || secretAccessKey === "") missingVars.push("AWS_SECRET_ACCESS_KEY");
    if (!bucketName || bucketName.includes("your_") || bucketName === "") missingVars.push("AWS_BUCKET_NAME");

    return {
      valid: missingVars.length === 0,
      provider: "AWS S3",
      providerType: "s3",
      missingVars,
      bucketName: bucketName || "",
    };
  } else {
    const accountId = cleanEnvVar(process.env.R2_ACCOUNT_ID);
    const accessKeyId = cleanEnvVar(process.env.R2_ACCESS_KEY_ID);
    const secretAccessKey = cleanEnvVar(process.env.R2_SECRET_ACCESS_KEY);
    const bucketName = cleanEnvVar(process.env.R2_BUCKET_NAME);

    const missingVars: string[] = [];
    if (!accountId || accountId.includes("your_") || accountId === "") missingVars.push("R2_ACCOUNT_ID");
    if (!accessKeyId || accessKeyId.includes("your_") || accessKeyId === "") missingVars.push("R2_ACCESS_KEY_ID");
    if (!secretAccessKey || secretAccessKey.includes("your_") || secretAccessKey === "") missingVars.push("R2_SECRET_ACCESS_KEY");
    if (!bucketName || bucketName.includes("your_") || bucketName === "") missingVars.push("R2_BUCKET_NAME");

    return {
      valid: missingVars.length === 0,
      provider: "Cloudflare R2",
      providerType: "r2",
      missingVars,
      bucketName: bucketName || "",
    };
  }
}

/**
 * Backward-compatible validation function for existing API routes.
 */
export function validateR2Config(): { valid: boolean; missingVars: string[] } {
  const result = validateStorageConfig();
  return {
    valid: result.valid,
    missingVars: result.missingVars,
  };
}

export function getBucketName(): string {
  const provider = getStorageProvider();
  if (provider === "s3") {
    return cleanEnvVar(
      process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME
    );
  }
  return cleanEnvVar(process.env.R2_BUCKET_NAME);
}

/**
 * Constructs the S3Client for either AWS S3 or Cloudflare R2.
 */
export function getStorageClient(): S3Client {
  const provider = getStorageProvider();

  if (provider === "s3") {
    const region = cleanEnvVar(process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1");
    const accessKeyId = cleanEnvVar(process.env.AWS_ACCESS_KEY_ID);
    const secretAccessKey = cleanEnvVar(process.env.AWS_SECRET_ACCESS_KEY);
    const endpoint = cleanEnvVar(process.env.AWS_ENDPOINT || process.env.S3_ENDPOINT);

    return new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    });
  }

  // Cloudflare R2
  const accountId = cleanEnvVar(process.env.R2_ACCOUNT_ID);
  const accessKeyId = cleanEnvVar(process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey = cleanEnvVar(process.env.R2_SECRET_ACCESS_KEY);

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getR2Client(): S3Client {
  return getStorageClient();
}

export const r2Client = new Proxy({} as S3Client, {
  get(_target, prop) {
    const client = getStorageClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export const BUCKET_NAME = getBucketName();

/**
 * Reads gallery index manifest from storage (AWS S3 or Cloudflare R2)
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
 * Writes gallery index manifest to storage (AWS S3 or Cloudflare R2)
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
    console.error("Error writing gallery manifest:", err);
    return false;
  }
}

/**
 * Adds a new record to the gallery manifest
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
 * Deletes records by keys from the gallery manifest
 */
export async function deleteR2ManifestRecords(userId = "admin", keys: string[]): Promise<boolean> {
  const targetKeys = new Set(keys);
  const current = await readR2Manifest(userId);
  const updated = current.filter((item) => !targetKeys.has(item.key) && !targetKeys.has(item.id));
  return await writeR2Manifest(userId, updated);
}
