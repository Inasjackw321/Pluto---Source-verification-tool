// node generate-icons.js  (requires: npm install canvas)
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const SIZES = [16, 48, 128];

for (const size of SIZES) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const cx = size / 2, cy = size / 2;
  const r = size * 0.29; // planet radius

  // ── Background: transparent round rect ──
  const bg = size * 0.14;
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

  // ── Ring (back half) ──
  const ringRx = r * 1.68, ringRy = r * 0.45;
  const angle = -28 * Math.PI / 180;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, ringRx, ringRy, 0, Math.PI, 0); // back half only
  ctx.strokeStyle = "rgba(196,181,253,0.55)";
  ctx.lineWidth = size * 0.065;
  ctx.stroke();
  ctx.restore();

  // ── Planet body ──
  const grad = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.28, r * 0.08, cx, cy, r);
  grad.addColorStop(0, "#a78bfa");
  grad.addColorStop(0.45, "#7c3aed");
  grad.addColorStop(1, "#4c1d95");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // ── Highlight ──
  const hlGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx - r * 0.3, cy - r * 0.3, r * 0.5);
  hlGrad.addColorStop(0, "rgba(216,200,255,0.45)");
  hlGrad.addColorStop(1, "rgba(216,200,255,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = hlGrad;
  ctx.fill();

  // ── Ring (front half) ──
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, ringRx, ringRy, 0, 0, Math.PI); // front half
  ctx.strokeStyle = "rgba(196,181,253,0.75)";
  ctx.lineWidth = size * 0.065;
  ctx.stroke();
  ctx.restore();

  const out = path.join(__dirname, "icons", `icon${size}.png`);
  fs.writeFileSync(out, canvas.toBuffer("image/png"));
  console.log(`Written: ${out}`);
}
