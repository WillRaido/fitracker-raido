import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = resolve(__dirname, "..", "public");

const standard = readFileSync(resolve(pub, "icon.svg"));
const maskable = readFileSync(resolve(pub, "icon-maskable.svg"));

const targets = [
  { src: standard, size: 192, out: "icon-192.png" },
  { src: standard, size: 512, out: "icon-512.png" },
  { src: maskable, size: 192, out: "icon-192-maskable.png" },
  { src: maskable, size: 512, out: "icon-512-maskable.png" },
  // Apple touch icon: fondo sólido (iOS no respeta transparencia bien)
  { src: standard, size: 180, out: "apple-touch-icon.png" },
];

for (const { src, size, out } of targets) {
  await sharp(src, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(resolve(pub, out));
  console.log(`✓ ${out} (${size}x${size})`);
}

// Favicon 32x32 para pestañas
await sharp(standard, { density: 384 })
  .resize(32, 32)
  .png()
  .toFile(resolve(pub, "favicon-32.png"));
console.log("✓ favicon-32.png (32x32)");
console.log("Iconos generados en /public");
