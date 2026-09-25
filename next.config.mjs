/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_STORAGE_PROVIDER: process.env.NEXT_PUBLIC_STORAGE_PROVIDER || (process.env.AWS_ACCESS_KEY_ID ? "AWS S3" : (process.env.R2_ACCOUNT_ID ? "Cloudflare R2" : "Local Storage")),
    NEXT_PUBLIC_AWS_BUCKET_NAME: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || process.env.AWS_BUCKET_NAME || "hi5creation",
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || "eu-north-1",
    NEXT_PUBLIC_R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || "",
  },
  ...(isStaticExport ? { output: "export", trailingSlash: true } : {}),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 's3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;

