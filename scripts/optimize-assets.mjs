import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const assetsDir = path.resolve(process.cwd(), 'public/assets');

async function optimizeImages() {
  const files = fs.readdirSync(assetsDir);
  let totalOldBytes = 0;
  let totalNewBytes = 0;
  let count = 0;

  console.log(`Starting image optimization in ${assetsDir}...`);

  for (const file of files) {
    const filePath = path.join(assetsDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() || !file.toLowerCase().endsWith('.png')) {
      continue;
    }

    totalOldBytes += stat.size;
    const oldMb = (stat.size / 1024 / 1024).toFixed(2);

    try {
      const image = sharp(filePath);
      const meta = await image.metadata();

      // Only resize if larger than 1600px width/height
      let pipeline = image;
      if (meta.width > 1600 || meta.height > 1600) {
        pipeline = pipeline.resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Optimize PNG with quality compression
      const optimizedBuffer = await pipeline
        .png({
          compressionLevel: 9,
          quality: 85,
          effort: 7,
          palette: true, // Generate 8-bit palette PNG if applicable for drastic size reduction with high visual quality
        })
        .toBuffer();

      if (optimizedBuffer.length < stat.size) {
        fs.writeFileSync(filePath, optimizedBuffer);
        totalNewBytes += optimizedBuffer.length;
        const newMb = (optimizedBuffer.length / 1024 / 1024).toFixed(2);
        console.log(`✓ ${file}: ${oldMb} MB -> ${newMb} MB (-${Math.round((1 - optimizedBuffer.length / stat.size) * 100)}%)`);
      } else {
        totalNewBytes += stat.size;
        console.log(`- ${file}: Kept original (${oldMb} MB)`);
      }
      count++;
    } catch (err) {
      console.error(`✕ Error optimizing ${file}:`, err.message);
      totalNewBytes += stat.size;
    }
  }

  const oldTotalMb = (totalOldBytes / 1024 / 1024).toFixed(2);
  const newTotalMb = (totalNewBytes / 1024 / 1024).toFixed(2);
  const savedMb = ((totalOldBytes - totalNewBytes) / 1024 / 1024).toFixed(2);
  const percentSaved = Math.round((1 - totalNewBytes / totalOldBytes) * 100);

  console.log(`\n========================================`);
  console.log(`Optimized ${count} PNG images:`);
  console.log(`Initial Size: ${oldTotalMb} MB`);
  console.log(`Optimized Size: ${newTotalMb} MB`);
  console.log(`Total Saved: ${savedMb} MB (${percentSaved}% reduction)`);
  console.log(`========================================\n`);
}

optimizeImages();
