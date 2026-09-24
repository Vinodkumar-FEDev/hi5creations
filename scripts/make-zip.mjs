import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const outDir = path.join(rootDir, "out");
const zipFile = path.join(rootDir, "milesweb-deploy.zip");

if (!fs.existsSync(outDir)) {
  console.error("❌ 'out' directory not found. Please run 'npm run build' first.");
  process.exit(1);
}

if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

console.log("📦 Creating milesweb-deploy.zip from out/ folder...");

const command = `powershell -NoProfile -Command "Get-ChildItem -Path '${outDir.replace(/'/g, "''")}' -Force | Compress-Archive -DestinationPath '${zipFile.replace(/'/g, "''")}' -Force"`;

execSync(command, {
  stdio: "inherit",
  cwd: rootDir,
});

if (fs.existsSync(zipFile)) {
  const stats = fs.statSync(zipFile);
  const sizeKb = (stats.size / 1024).toFixed(1);
  console.log(`✅ Success! Created milesweb-deploy.zip (${sizeKb} KB) ready for MilesWeb upload.`);
} else {
  console.error("❌ Failed to create zip file.");
  process.exit(1);
}
