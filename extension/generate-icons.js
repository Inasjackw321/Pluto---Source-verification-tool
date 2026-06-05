// node generate-icons.js  (requires: npm install canvas)
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const SIZES = [16, 48, 128];

for (const size of SIZES) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // ── Background: dark rounded rect ──
  const bg = size * 0.18;
  ctx.fillStyle = "#0c0c14";
  ctx.beginPath();
  ctx.moveTo(bg, 0); ctx.lineTo(size - bg, 0);
  ctx.quadraticCurveTo(size, 0, size, bg);
  ctx.lineTo(size, size - bg);
  ctx.quadraticCurveTo(size, size, size - bg, size);
  ctx.lineTo(bg, size);
  ctx.quadraticCurveTo(0, size, 0, size - bg);
  ctx.lineTo(0, bg);
  ctx.quadraticCurveTo(0, 0, bg, 0);
  ctx.closePath();
  ctx.fill();

  // Proportional values based on viewBox 0 0 36 36 scaled to `size`
  const scale  = size / 36;
  const lensX  = 14 * scale;
  const lensY  = 14 * scale;
  const lensR  = 9  * scale;
  const sw     = 2.2 * scale;  // stroke width for lens ring
  const crossW = 1.8 * scale;  // stroke width for crosshair
  const handleW = 3  * scale;  // stroke width for handle

  ctx.lineCap = "round";

  // ── Lens fill (subtle purple tint) ──
  ctx.beginPath();
  ctx.arc(lensX, lensY, lensR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(124,58,237,0.15)";
  ctx.fill();

  // ── Lens ring ──
  ctx.beginPath();
  ctx.arc(lensX, lensY, lensR, 0, Math.PI * 2);
  ctx.strokeStyle = "#a78bfa";
  ctx.lineWidth = sw;
  ctx.stroke();

  // ── Plus / crosshair inside lens ──
  const armLen = lensR * 0.55;
  ctx.strokeStyle = "#c4b5fd";
  ctx.lineWidth = crossW;
  // vertical
  ctx.beginPath();
  ctx.moveTo(lensX, lensY - armLen);
  ctx.lineTo(lensX, lensY + armLen);
  ctx.stroke();
  // horizontal
  ctx.beginPath();
  ctx.moveTo(lensX - armLen, lensY);
  ctx.lineTo(lensX + armLen, lensY);
  ctx.stroke();

  // ── Handle ──
  const handleStart = 21 * scale;
  const handleEnd   = 29.5 * scale;
  ctx.strokeStyle = "#a78bfa";
  ctx.lineWidth = handleW;
  ctx.beginPath();
  ctx.moveTo(handleStart, handleStart);
  ctx.lineTo(handleEnd, handleEnd);
  ctx.stroke();

  const out = path.join(__dirname, "icons", `icon${size}.png`);
  fs.writeFileSync(out, canvas.toBuffer("image/png"));
  console.log(`Written: ${out}`);
}
