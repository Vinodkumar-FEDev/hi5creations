import "server-only";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function cleanEnvVar(val: string | undefined): string {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "");
}

export interface StorageConfig {
  valid: boolean;
  provider: "AWS S3" | "Cloudflare R2" | "Local Storage";
  providerType: "s3" | "r2" | "local";
  missingVars: string[];
  bucketName: string;
  region: string;
}

/**
 * Validates AWS S3 or Cloudflare R2 credentials.
 */
export function validateStorageConfig(): StorageConfig {
  const awsKey = cleanEnvVar(process.env.AWS_ACCESS_KEY_ID);
  const awsSecret = cleanEnvVar(process.env.AWS_SECRET_ACCESS_KEY);
  const awsBucket = cleanEnvVar(process.env.AWS_BUCKET_NAME || "hi5creation");
  const awsRegion = cleanEnvVar(process.env.AWS_REGION || "eu-north-1");

  if (awsKey && !awsKey.includes("your_") && awsSecret && !awsSecret.includes("your_") && awsBucket) {
    return {
      valid: true,
      provider: "AWS S3",
      providerType: "s3",
      missingVars: [],
      bucketName: awsBucket,
      region: awsRegion,
    };
  }

  // Cloudflare R2 detection
  const r2Account = cleanEnvVar(process.env.R2_ACCOUNT_ID);
  const r2Key = cleanEnvVar(process.env.R2_ACCESS_KEY_ID);
  const r2Secret = cleanEnvVar(process.env.R2_SECRET_ACCESS_KEY);
  const r2Bucket = cleanEnvVar(process.env.R2_BUCKET_NAME);

  if (r2Account && !r2Account.includes("your_") && r2Key && r2Secret && r2Bucket) {
    return {
      valid: true,
      provider: "Cloudflare R2",
      providerType: "r2",
      missingVars: [],
      bucketName: r2Bucket,
      region: "auto",
    };
  }

  const missing: string[] = [];
  if (!awsKey) missing.push("AWS_ACCESS_KEY_ID");
  if (!awsSecret) missing.push("AWS_SECRET_ACCESS_KEY");
  if (!awsBucket) missing.push("AWS_BUCKET_NAME");

  return {
    valid: false,
    provider: "Local Storage",
    providerType: "local",
    missingVars: missing,
    bucketName: awsBucket || "hi5creation",
    region: awsRegion,
  };
}

export function validateR2Config() {
  return validateStorageConfig();
}

export function getBucketName(): string {
  const config = validateStorageConfig();
  return config.bucketName || "hi5creation";
}

let cachedS3Client: S3Client | null = null;

export function getStorageClient(): S3Client {
  if (cachedS3Client) return cachedS3Client;

  const config = validateStorageConfig();

  if (config.providerType === "r2") {
    const accountId = cleanEnvVar(process.env.R2_ACCOUNT_ID);
    const accessKeyId = cleanEnvVar(process.env.R2_ACCESS_KEY_ID);
    const secretAccessKey = cleanEnvVar(process.env.R2_SECRET_ACCESS_KEY);

    cachedS3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
    return cachedS3Client;
  }

  // Default: AWS S3
  const region = cleanEnvVar(process.env.AWS_REGION || "eu-north-1");
  const accessKeyId = cleanEnvVar(process.env.AWS_ACCESS_KEY_ID);
  const secretAccessKey = cleanEnvVar(process.env.AWS_SECRET_ACCESS_KEY);

  cachedS3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  return cachedS3Client;
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
 * Returns public or signed URL for an S3 object
 */
export async function getImageUrl(key: string): Promise<string> {
  const bucket = getBucketName();
  const region = cleanEnvVar(process.env.AWS_REGION || "eu-north-1");

  // In AWS S3, standard public URL format:
  const directPublicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  try {
    const client = getStorageClient();
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    // Generate signed URL with 7 days validity
    return await getSignedUrl(client, cmd, { expiresIn: 604800 });
  } catch {
    return directPublicUrl;
  }
}

/**
 * Reads gallery index manifest from S3
 */
export async function readR2Manifest(userId = "admin"): Promise<any[]> {
  try {
    const manifestKey = `users/${userId}/gallery-manifest.json`;
    const client = getStorageClient();
    const cmd = new GetObjectCommand({ Bucket: getBucketName(), Key: manifestKey });
    const res = await client.send(cmd);
    const bodyStr = await res.Body?.transformToString();
    if (bodyStr) {
      const parsed = JSON.parse(bodyStr);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // If manifest doesn't exist yet, return empty array
  }
  return [];
}

/**
 * Writes gallery index manifest to S3
 */
export async function writeR2Manifest(userId = "admin", items: any[]): Promise<boolean> {
  try {
    const manifestKey = `users/${userId}/gallery-manifest.json`;
    const client = getStorageClient();
    const cmd = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: manifestKey,
      Body: JSON.stringify(items, null, 2),
      ContentType: "application/json",
    });
    await client.send(cmd);
    return true;
  } catch (err) {
    console.error("Error writing S3 gallery manifest:", err);
    return false;
  }
}

/**
 * Adds a new record to the gallery manifest on S3
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
 * Deletes records by keys from the gallery manifest on S3
 */
export async function deleteR2ManifestRecords(userId = "admin", keys: string[]): Promise<boolean> {
  const targetKeys = new Set(keys);
  const current = await readR2Manifest(userId);
  const updated = current.filter((item) => !targetKeys.has(item.key) && !targetKeys.has(item.id));
  return await writeR2Manifest(userId, updated);
}

/**
 * Deletes one or more objects from AWS S3
 */
export async function deleteS3Objects(keys: string[]): Promise<boolean> {
  if (keys.length === 0) return true;
  try {
    const client = getStorageClient();
    const bucket = getBucketName();

    if (keys.length === 1) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: keys[0] }));
    } else {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: keys.map((k) => ({ Key: k })),
            Quiet: true,
          },
        })
      );
    }
    return true;
  } catch (err) {
    console.error("Error deleting objects from S3:", err);
    return false;
  }
}
