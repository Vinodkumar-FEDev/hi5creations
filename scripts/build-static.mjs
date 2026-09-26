import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();

if (process.env.VERCEL) {
  console.log("⚡ Vercel environment detected. Running native next build...");
  execSync("npx next build", { stdio: "inherit", cwd: rootDir });
  process.exit(0);
}

console.log("🚀 Preparing static export build for cPanel public_html hosting...");

try {
  try {
    if (process.platform === "win32") {
      execSync('powershell -NoProfile -Command "if (Test-Path \'.next\') { Remove-Item -Recurse -Force \'.next\' }; if (Test-Path \'out\') { Remove-Item -Recurse -Force \'out\' }"', { stdio: "ignore" });
    } else {
      fs.rmSync(path.join(rootDir, ".next"), { recursive: true, force: true });
      fs.rmSync(path.join(rootDir, "out"), { recursive: true, force: true });
    }
  } catch (_) {}
  const apiDir = path.join(rootDir, "src", "app", "api");
  const tempApiDir = path.join(rootDir, ".api-temp");
  let stashedApi = false;

  try {
    if (fs.existsSync(apiDir)) {
      if (fs.existsSync(tempApiDir)) {
        fs.rmSync(tempApiDir, { recursive: true, force: true });
      }
      fs.cpSync(apiDir, tempApiDir, { recursive: true });
      fs.rmSync(apiDir, { recursive: true, force: true });
      stashedApi = true;
    }

    console.log("⚡ Running Next.js static export build...");
    execSync("npx next build", {
      stdio: "inherit",
      cwd: rootDir,
      env: { ...process.env, STATIC_EXPORT: "true" },
    });
  } finally {
    if (stashedApi && fs.existsSync(tempApiDir)) {
      if (!fs.existsSync(apiDir)) {
        fs.cpSync(tempApiDir, apiDir, { recursive: true });
      }
      fs.rmSync(tempApiDir, { recursive: true, force: true });
      console.log("✔ Restored Next.js API routes.");
    }
  }

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
