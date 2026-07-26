"use client";
import { useEffect, useRef } from "react";
import { buildPlaneParticles } from "@/lib/noiseParticles";

const PI2 = Math.PI * 2;

// Polygon-based plane — 4500 particles, 92% on outer outline, symmetric
const RAW = buildPlaneParticles(4500);
const NP  = RAW.length;
const BX  = new Float32Array(NP);
const BY  = new Float32Array(NP);
const BZ  = new Float32Array(NP);
for (let i = 0; i < NP; i++) { BX[i] = RAW[i].x; BY[i] = RAW[i].y; BZ[i] = RAW[i].z; }

const px  = new Float32Array(NP);
const py  = new Float32Array(NP);
const pdz = new Float32Array(NP);

const DEPTH_PASSES = [
  { lo: -2,    hi: -0.50, r: 1.0, fill: "rgba(255,45,53,0.25)" },
  { lo: -0.50, hi:  0.00, r: 1.3, fill: "rgba(255,45,53,0.52)" },
  { lo:  0.00, hi:  0.50, r: 1.7, fill: "rgba(255,45,53,0.82)" },
  { lo:  0.50, hi:  2,    r: 2.0, fill: "rgba(255,45,53,0.96)" },
];

const CORNERS = ["tl","tr","bl","br"] as const;
interface Props { width?: number; height?: number }

export default function HologramPlane({ width = 500, height = 580 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = width, H = height;

    // Polygon lives in XY plane — max radius from center ≈ 1.30 units
    // ne sized so max extent = 1.30 * ne < half-canvas-width
    const ne    = Math.min(W, H) * 0.34;
    const CX    = W / 2, CY = H / 2;
    const focal = ne * 3.0;  // wider focal = less distortion at edges

    // Fixed 45° X-tilt then Y-spin — plane seen from 45° angle while rotating
    const RX = Math.PI / 4;
    const cosRX = Math.cos(RX), sinRX = Math.sin(RX);

    let iy = 0, scanY = 0, raf = 0;

    const draw = () => {
      iy += 0.007;
      scanY = (scanY + 0.90) % (H + 30);
      ctx.clearRect(0, 0, W, H);

      const cosY = Math.cos(iy), sinY = Math.sin(iy);

      for (let i = 0; i < NP; i++) {
        const x = BX[i], y = BY[i], z = BZ[i];
        // Y-axis spin
        const rx  =  x * cosY - z * sinY;
        const rz  =  x * sinY + z * cosY;
        // Fixed 45° X-tilt
        const ry  =  y * cosRX - rz * sinRX;
        const rz2 =  y * sinRX + rz * cosRX;
        // Perspective
        const A   = focal / (focal + rz2 * ne);
        px[i]  = CX + rx  * ne * A;
        py[i]  = CY - ry  * ne * A;
        pdz[i] = rz2;
      }

      // 4 depth passes: back→front for 3D depth illusion
      for (const { lo, hi, r, fill } of DEPTH_PASSES) {
        ctx.beginPath();
        for (let i = 0; i < NP; i++) {
          if (pdz[i] < lo || pdz[i] >= hi) continue;
          ctx.moveTo(px[i] + r, py[i]);
          ctx.arc(px[i], py[i], r, 0, PI2);
        }
        ctx.fillStyle = fill;
        ctx.fill();
      }

      // Centre glow
      const gL = ctx.createRadialGradient(CX, CY, 0, CX, CY, ne * 0.7);
      gL.addColorStop(0, "rgba(255,0,53,0.06)"); gL.addColorStop(1, "transparent");
      ctx.fillStyle = gL; ctx.fillRect(0, 0, W, H);

      // Scan line
      const sg = ctx.createLinearGradient(0, scanY - 22, 0, scanY + 3);
      sg.addColorStop(0, "transparent"); sg.addColorStop(1, "rgba(255,0,53,0.09)");
      ctx.fillStyle = sg; ctx.fillRect(0, scanY - 22, W, 25);
      ctx.beginPath(); ctx.strokeStyle = "rgba(255,0,53,0.40)"; ctx.lineWidth = 1;
      ctx.moveTo(0, scanY); ctx.lineTo(W, scanY); ctx.stroke();

      if (Math.random() < 0.012) { ctx.fillStyle = "rgba(255,0,53,0.03)"; ctx.fillRect(0, 0, W, H); }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <div style={{ position: "relative", width, height, display: "inline-block" }}>
      {CORNERS.map(c => (
        <div key={c} style={{
          position: "absolute", zIndex: 4,
          top: c[0]==="t"?0:"auto", bottom: c[0]==="b"?0:"auto",
          left: c[1]==="l"?0:"auto", right: c[1]==="r"?0:"auto",
          width: 14, height: 14,
          borderTop:    c[0]==="t"?"1.5px solid rgba(255,0,53,0.65)":"none",
          borderBottom: c[0]==="b"?"1.5px solid rgba(255,0,53,0.65)":"none",
          borderLeft:   c[1]==="l"?"1.5px solid rgba(255,0,53,0.65)":"none",
          borderRight:  c[1]==="r"?"1.5px solid rgba(255,0,53,0.65)":"none",
        }} />
      ))}
      <canvas ref={canvasRef} style={{
        display: "block", width, height,
        clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)",
        filter: "drop-shadow(0 0 18px rgba(255,0,53,0.30))",
      }} />
      <div style={{ position:"absolute", left:0, right:0, height:28, background:"linear-gradient(transparent,rgba(255,0,53,0.09),transparent)", animation:"hologram-scan 3.5s linear infinite", pointerEvents:"none", zIndex:3 }} />
      <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", zIndex:4, fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.22em", color:"rgba(255,0,53,0.4)", whiteSpace:"nowrap" }}>◆ AIRCRAFT · SCAN ◆</div>
    </div>
  );
}
