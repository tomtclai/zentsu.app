// Run from project root: node scripts/optimize-images.js
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_DIR = path.resolve(__dirname, '..', 'assets');

async function fileExistsAndNewer(outPath, sourceMtimeMs) {
  try {
    const s = await stat(outPath);
    return s.mtimeMs >= sourceMtimeMs;
  } catch {
    return false;
  }
}

async function processImage(srcPath) {
  const dir = path.dirname(srcPath);
  const base = path.basename(srcPath, '.png');
  const baseName = path.basename(srcPath);

  const webpPath = path.join(dir, `${base}.webp`);
  const avifPath = path.join(dir, `${base}.avif`);
  const png2xPath = path.join(dir, `${base}@2x.png`);
  const png1xPath = path.join(dir, `${base}@1x.png`);

  const srcStat = await stat(srcPath);
  const srcMtime = srcStat.mtimeMs;

  const [webpFresh, avifFresh, png2xFresh, png1xFresh] = await Promise.all([
    fileExistsAndNewer(webpPath, srcMtime),
    fileExistsAndNewer(avifPath, srcMtime),
    fileExistsAndNewer(png2xPath, srcMtime),
    fileExistsAndNewer(png1xPath, srcMtime),
  ]);

  if (webpFresh && avifFresh && png2xFresh && png1xFresh) {
    console.log(`[skip] ${baseName}`);
    return;
  }

  const image = sharp(srcPath);
  const metadata = await image.metadata();
  const halfWidth = Math.max(1, Math.round((metadata.width ?? 2) / 2));

  const tasks = [];

  if (!webpFresh) {
    tasks.push(sharp(srcPath).webp({ quality: 85 }).toFile(webpPath));
  }
  if (!avifFresh) {
    tasks.push(sharp(srcPath).avif({ quality: 60 }).toFile(avifPath));
  }
  if (!png2xFresh) {
    tasks.push(sharp(srcPath).png().toFile(png2xPath));
  }
  if (!png1xFresh) {
    tasks.push(sharp(srcPath).resize({ width: halfWidth }).png().toFile(png1xPath));
  }

  await Promise.all(tasks);
  console.log(`[done] ${baseName} → webp, avif, @2x, @1x`);
}

async function main() {
  const entries = await readdir(ASSETS_DIR);
  const pngs = entries.filter(
    (name) => name.toLowerCase().endsWith('.png') && !/@(1x|2x)\.png$/i.test(name),
  );

  for (const name of pngs) {
    const srcPath = path.join(ASSETS_DIR, name);
    try {
      await processImage(srcPath);
    } catch (err) {
      console.error(`[fail] ${name}:`, err.message);
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
