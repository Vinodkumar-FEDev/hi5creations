import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export async function generateFaviconIco() {
  const svgPath = path.join(rootDir, 'public', 'favicon.svg');
  const icoPath = path.join(rootDir, 'public', 'favicon.ico');

  if (!fs.existsSync(svgPath)) {
    console.warn('public/favicon.svg not found, skipping ICO generation.');
    return;
  }

  const svg = fs.readFileSync(svgPath);

  // 1. Generate Google & Apple recommended PNG favicons
  const pngSizes = [
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const { name, size } of pngSizes) {
    try {
      const outPath = path.join(rootDir, 'public', name);
      await sharp(svg)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outPath);
      console.log(`✅ Generated public/${name} (${size}x${size})`);
    } catch (err) {
      console.warn(`Warning generating ${name}:`, err.message);
    }
  }

  // 2. Generate multi-resolution favicon.ico (16, 32, 48)
  const sizes = [16, 32, 48];
  const images = [];

  for (const size of sizes) {
    const buffer = await sharp(svg)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    images.push({ width: size, height: size, buffer });
  }

  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(count, 4); // count

  let currentOffset = 6 + 16 * count;
  const dirEntries = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(img.buffer.length, 8); // size
    entry.writeUInt32LE(currentOffset, 12); // offset
    dirEntries.push(entry);
    currentOffset += img.buffer.length;
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...images.map((i) => i.buffer)]);
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`✅ Generated public/favicon.ico (${icoBuffer.length} bytes) from favicon.svg`);
}

// Run directly if invoked via node
if (process.argv[1] === __filename) {
  generateFaviconIco().catch(console.error);
}
