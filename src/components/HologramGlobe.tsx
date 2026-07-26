"use client";
import { useEffect, useRef } from "react";

const PI2 = Math.PI * 2;

// Fibonacci sphere — same distribution as mintrans.uz globe (golden angle)
// Gives perfectly uniform point coverage on sphere surface
const N_PTS  = 4500;
const BP     = new Float32Array(N_PTS); // phi (longitude)
const TH     = new Float32Array(N_PTS); // theta (latitude)
const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ≈ 2.39996 rad
for (let i = 0; i < N_PTS; i++) {
  const y    = 1 - (i / (N_PTS - 1)) * 2;   // uniform latitude -1..1
  const r    = Math.sqrt(Math.max(0, 1 - y * y));
  const phi  = goldenAngle * i;
  BP[i] = phi;
  TH[i] = Math.acos(Math.max(-1, Math.min(1, y)));
}

const px   = new Float32Array(N_PTS);
const py   = new Float32Array(N_PTS);
const pdz  = new Float32Array(N_PTS);

const DEPTH_PASSES = [
  { lo: -2,    hi: -0.50, r: 1.0, fill: "rgba(255,45,53,0.25)" },
  { lo: -0.50, hi:  0.00, r: 1.3, fill: "rgba(255,45,53,0.52)" },
  { lo:  0.00, hi:  0.50, r: 1.7, fill: "rgba(255,45,53,0.82)" },
  { lo:  0.50, hi:  2,    r: 2.0, fill: "rgba(255,45,53,0.96)" },
];

function isLand(lat: number, lon: number): boolean {
  const la = lat, lo = lon;
  if (la > 25  && la < 72  && lo > -170 && lo < -53)  return true; // N.America
  if (la > 7   && la < 25  && lo > -95  && lo < -77)  return true; // C.America
  if (la > -57 && la < 13  && lo > -82  && lo < -34)  return true; // S.America
  if (la > 36  && la < 72  && lo > -12  && lo < 42)   return true; // Europe
  if (la > 49  && la < 62  && lo > -12  && lo < 2)    return true; // British Isles
  if (la > -35 && la < 37  && lo > -18  && lo < 52)   return true; // Africa
  if (la > 12  && la < 32  && lo > 36   && lo < 62)   return true; // Arabia
  if (la > 48  && la < 78  && lo > 26   && lo < 180)  return true; // Russia/Asia
  if (la > 48  && la < 78  && lo > -180 && lo < -165) return true; // E.Russia
  if (la > 7   && la < 37  && lo > 68   && lo < 88)   return true; // India
  if (la > 5   && la < 28  && lo > 98   && lo < 110)  return true; // Indochina
  if (la > 20  && la < 50  && lo > 106  && lo < 145)  return true; // E.Asia
  if (la > 30  && la < 46  && lo > 129  && lo < 146)  return true; // Japan
  if (la > -10 && la < 8   && lo > 95   && lo < 142)  return true; // SE Asia isl.
  if (la > 5   && la < 20  && lo > 117  && lo < 128)  return true; // Philippines
  if (la > -44 && la < -10 && lo > 113  && lo < 155)  return true; // Australia
  if (la > -47 && la < -34 && lo > 165  && lo < 178)  return true; // New Zealand
  if (la > 60  && la < 84  && lo > -58  && lo < -16)  return true; // Greenland
  if (la > 63  && la < 67  && lo > -26  && lo < -12)  return true; // Iceland
  if (la > -27 && la < -11 && lo > 43   && lo < 51)   return true; // Madagascar
  if (la < -72)                                        return true; // Antarctica
  return false;
}

const LAND = new Uint8Array(N_PTS);
for (let i = 0; i < N_PTS; i++) {
  const lon360 = (BP[i] % PI2) * (180 / Math.PI);
  const lon    = lon360 > 180 ? lon360 - 360 : lon360;
  const lat    = 90 - TH[i] * (180 / Math.PI);
  LAND[i]      = isLand(lat, lon) ? 1 : 0;
}

const CORNERS = ["tl","tr","bl","br"] as const;
interface Props { width?: number; height?: number }

export default function HologramGlobe({ width = 360, height = 360 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = width, H = height;
    const R  = Math.min(W, H) * 0.44;
    const CX = W / 2, CY = H / 2;

    let t = 0, scanY = 0, raf = 0;

    const draw = () => {
      t += 0.012; scanY = (scanY + 0.85) % (H + 30);
      ctx.clearRect(0, 0, W, H);

      // Project Fibonacci sphere — rotating around Y axis
      for (let i = 0; i < N_PTS; i++) {
        const phi = BP[i] + t, th = TH[i];
        const st = Math.sin(th), ct = Math.cos(th);
        const x3 = st * Math.cos(phi);
        const y3 = ct;
        const z3 = st * Math.sin(phi);
        px[i]  = CX + R * x3;
        py[i]  = CY - R * y3;
        pdz[i] = z3; // depth: -1=back, +1=front
      }

      // Ocean: very faint — preserves sphere silhouette
      ctx.beginPath();
      for (let i = 0; i < N_PTS; i++) {
        if (LAND[i]) continue;
        ctx.moveTo(px[i] + 0.7, py[i]);
        ctx.arc(px[i], py[i], 0.7, 0, PI2);
      }
      ctx.fillStyle = "rgba(255,45,53,0.09)";
      ctx.fill();

      // Land: 4 depth tiers — qitalar 3D depth bilan
      for (const { lo, hi, r, fill } of DEPTH_PASSES) {
        ctx.beginPath();
        for (let i = 0; i < N_PTS; i++) {
          if (!LAND[i] || pdz[i] < lo || pdz[i] >= hi) continue;
          ctx.moveTo(px[i] + r, py[i]);
          ctx.arc(px[i], py[i], r, 0, PI2);
        }
        ctx.fillStyle = fill;
        ctx.fill();
      }

      // Atmosphere glow ring
      const atm = ctx.createRadialGradient(CX, CY, R * 0.82, CX, CY, R * 1.25);
      atm.addColorStop(0, "rgba(255,0,53,0.07)"); atm.addColorStop(1, "transparent");
      ctx.fillStyle = atm;
      ctx.beginPath(); ctx.arc(CX, CY, R * 1.25, 0, PI2); ctx.fill();

      // Scan line
      const sg = ctx.createLinearGradient(0, scanY - 24, 0, scanY + 3);
      sg.addColorStop(0, "transparent"); sg.addColorStop(1, "rgba(255,0,53,0.09)");
      ctx.fillStyle = sg; ctx.fillRect(0, scanY - 24, W, 27);
      ctx.beginPath(); ctx.strokeStyle = "rgba(255,0,53,0.40)"; ctx.lineWidth = 1;
      ctx.moveTo(0, scanY); ctx.lineTo(W, scanY); ctx.stroke();

      if (Math.random() < 0.012) { ctx.fillStyle = "rgba(255,0,53,0.03)"; ctx.fillRect(0, 0, W, H); }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
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
        filter: "drop-shadow(0 0 18px rgba(255,0,53,0.32))",
      }} />
      <div style={{ position:"absolute", left:0, right:0, height:28, background:"linear-gradient(transparent,rgba(255,0,53,0.09),transparent)", animation:"hologram-scan 3.5s linear infinite", pointerEvents:"none", zIndex:3 }} />
      <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", zIndex:4, fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.22em", color:"rgba(255,0,53,0.4)", whiteSpace:"nowrap" }}>◆ EARTH · SCAN ◆</div>
    </div>
  );
}
