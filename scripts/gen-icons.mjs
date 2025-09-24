import sharp from 'sharp';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const svgPath = resolve('public', 'favicon.svg');
const outDir = resolve('public', 'icons');

async function ensureDir(dir) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

async function generate() {
  const svg = await readFile(svgPath);
  await ensureDir(outDir);
  const sizes = [192, 512];
  for (const size of sizes) {
    const png = await sharp(svg).resize(size, size).png().toBuffer();
    const out = resolve(outDir, `icon-${size}.png`);
    await writeFile(out, png);
    console.log(`[icons] generated ${out}`);
  }
}

generate().catch((e) => {
  console.error('[icons] failed', e);
  process.exit(1);
});


