import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const svg = readFileSync(new URL('../public/icon.svg', import.meta.url));

for (const size of [192, 512]) {
  const outPath = fileURLToPath(new URL(`../public/icon-${size}.png`, import.meta.url));
  await sharp(svg).resize(size, size).png().toFile(outPath);
}

console.log('icons written');
