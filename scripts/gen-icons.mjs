// Generate simple PWA icons using node:canvas-less approach.
// Outputs minimal PNG files via dataURL → fs write.
// Run: node scripts/gen-icons.mjs
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

function svg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3b82f6"/>
      <stop offset="1" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#g)" rx="${size * 0.22}"/>
  <text x="50%" y="55%" font-family="system-ui, sans-serif" font-size="${size * 0.5}" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">AI</text>
  <text x="50%" y="80%" font-family="system-ui, sans-serif" font-size="${size * 0.13}" fill="white" text-anchor="middle" opacity="0.85">SECRETARY</text>
</svg>`;
}

[192, 512].forEach((size) => {
  writeFileSync(join(publicDir, `icon-${size}.svg`), svg(size));
  console.log(`✓ icon-${size}.svg`);
});

// Also write a 32x32 favicon-style svg
writeFileSync(join(publicDir, "favicon.svg"), svg(32));
console.log("✓ favicon.svg");
