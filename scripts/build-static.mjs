import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();

console.log("🚀 Preparing static export build for cPanel public_html hosting...");

try {
  console.log("⚡ Running Next.js static export build...");
  execSync("npx next build", {
    stdio: "inherit",
    cwd: rootDir,
    env: { ...process.env, STATIC_EXPORT: "true" },
  });

  const publicApiDir = path.join(rootDir, "public", "api");
  const outApiDir = path.join(rootDir, "out", "api");
  if (fs.existsSync(publicApiDir)) {
    console.log("🐘 Copying PHP API backend to out/api for cPanel public_html...");
    if (fs.existsSync(outApiDir)) {
      fs.rmSync(outApiDir, { recursive: true, force: true });
    }
    fs.cpSync(publicApiDir, outApiDir, { recursive: true });
  }

  const publicHtaccess = path.join(rootDir, "public", ".htaccess");
  const outHtaccess = path.join(rootDir, "out", ".htaccess");
  if (fs.existsSync(publicHtaccess)) {
    fs.copyFileSync(publicHtaccess, outHtaccess);
  }

  console.log("✅ Static build succeeded! Files exported to the 'out/' directory.");
} catch (err) {
  console.error("❌ Build failed:", err.message);
  process.exitCode = 1;
}
