import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const csDist = path.join(rootDir, "comingsoon-dist");
const zipFile = path.join(rootDir, "milesweb-comingsoon.zip");

if (fs.existsSync(csDist)) {
  fs.rmSync(csDist, { recursive: true, force: true });
}
fs.mkdirSync(csDist, { recursive: true });

// 1. Copy coming-soon.html as index.html
fs.copyFileSync(
  path.join(rootDir, "coming-soon.html"),
  path.join(csDist, "index.html")
);

// 2. Copy brand assets (logo, emblem, icons)
const assetsSrc = path.join(rootDir, "public", "assets");
const assetsDest = path.join(csDist, "assets");
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
}

// 3. Copy root icon and .htaccess
const htaccessSrc = path.join(rootDir, "public", ".htaccess");
if (fs.existsSync(htaccessSrc)) {
  fs.copyFileSync(htaccessSrc, path.join(csDist, ".htaccess"));
}

const iconSrc = path.join(rootDir, "public", "icon.svg");
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(csDist, "icon.svg"));
}

if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

console.log("📦 Creating milesweb-comingsoon.zip...");
const command = `powershell -NoProfile -Command "Get-ChildItem -Path '${csDist.replace(/'/g, "''")}' -Force | Compress-Archive -DestinationPath '${zipFile.replace(/'/g, "''")}' -Force"`;

execSync(command, {
  stdio: "inherit",
  cwd: rootDir,
});

if (fs.existsSync(zipFile)) {
  const stats = fs.statSync(zipFile);
  const sizeKb = (stats.size / 1024).toFixed(1);
  console.log(`✅ Success! Created milesweb-comingsoon.zip (${sizeKb} KB) ready for MilesWeb upload.`);
} else {
  console.error("❌ Failed to create zip file.");
  process.exit(1);
}
