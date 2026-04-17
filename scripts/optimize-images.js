#!/usr/bin/env node
/**
 * Generate AVIF + WebP variants of every raster image in public/images/.
 * Idempotent: skips outputs that already exist and are newer than their source.
 * Usage: `npm run optimize-images`
 */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.resolve(__dirname, '..', 'public', 'images');

const SOURCE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const AVIF_QUALITY = 60;
const WEBP_QUALITY = 80;

async function needsRebuild(src, out) {
  try {
    const [srcStat, outStat] = await Promise.all([stat(src), stat(out)]);
    return outStat.mtimeMs < srcStat.mtimeMs;
  } catch {
    return true; // out missing
  }
}

async function run() {
  const entries = await readdir(IMG_DIR);
  let generated = 0, skipped = 0, totalSaved = 0;

  for (const entry of entries) {
    const ext = path.extname(entry).toLowerCase();
    if (!SOURCE_EXTS.has(ext)) continue;

    const src = path.join(IMG_DIR, entry);
    const base = path.basename(entry, ext);
    const avifOut = path.join(IMG_DIR, `${base}.avif`);
    const webpOut = path.join(IMG_DIR, `${base}.webp`);
    const origSize = (await stat(src)).size;

    // AVIF
    if (await needsRebuild(src, avifOut)) {
      await sharp(src).avif({ quality: AVIF_QUALITY, effort: 4 }).toFile(avifOut);
      const s = (await stat(avifOut)).size;
      totalSaved += Math.max(0, origSize - s);
      console.log(
        `  AVIF  ${entry.padEnd(22)} ${(origSize / 1024).toFixed(0).padStart(5)} KB ` +
        `→ ${(s / 1024).toFixed(0).padStart(4)} KB  (−${Math.round(100 - (s / origSize) * 100)}%)`
      );
      generated++;
    } else { skipped++; }

    // WebP (skip generation if source IS webp — it's already its own webp)
    if (ext !== '.webp') {
      if (await needsRebuild(src, webpOut)) {
        await sharp(src).webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(webpOut);
        const s = (await stat(webpOut)).size;
        totalSaved += Math.max(0, origSize - s);
        console.log(
          `  WebP  ${entry.padEnd(22)} ${(origSize / 1024).toFixed(0).padStart(5)} KB ` +
          `→ ${(s / 1024).toFixed(0).padStart(4)} KB  (−${Math.round(100 - (s / origSize) * 100)}%)`
        );
        generated++;
      } else { skipped++; }
    }
  }

  console.log(`\n  ${generated} generated, ${skipped} skipped (up to date).`);
  console.log(`  Approx. total transfer saved if AVIF served: ${(totalSaved / 1024 / 1024).toFixed(1)} MB\n`);
}

run().catch(err => { console.error(err); process.exit(1); });
