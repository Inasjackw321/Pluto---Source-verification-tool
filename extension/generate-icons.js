// Run once with Node.js to generate icon PNGs from the inline SVG below.
// Usage: node generate-icons.js
// Requires: npm install canvas

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const SIZES = [16, 48, 128];

for (const size of SIZES) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#1d1d1f";
  const r = size * 0.18;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // "M" letter
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.round(size * 0.62)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("M", size / 2, size / 2 + size * 0.03);

  const out = path.join(__dirname, "icons", `icon${size}.png`);
  fs.writeFileSync(out, canvas.toBuffer("image/png"));
  console.log(`Written: ${out}`);
}
