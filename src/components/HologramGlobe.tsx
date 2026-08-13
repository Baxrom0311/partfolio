"use client";
import { useEffect, useRef } from "react";
import { isLandLatLon } from "@/lib/landMask";

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

const N_BUCKETS = 12;
const B_R = new Float32Array(N_BUCKETS);
const B_A: string[] = [];
for (let b = 0; b < N_BUCKETS; b++) {
  const t = (b + 0.5) / N_BUCKETS;          // 0=back … 1=front
  B_R[b] = 0.9 + t * 1.2;                   // radius 0.9px → 2.1px
  B_A.push("rgba(255,45,53," + (0.18 + t * 0.78).toFixed(3) + ")");
}

const LAND = new Uint8Array(N_PTS);
for (let i = 0; i < N_PTS; i++) {
  // Screen x = cos(phi), so larger phi renders further LEFT; real longitude must
  // therefore DECREASE with phi or continents come out mirror-imaged.
  const lonDeg = ((-(BP[i]) * 180 / Math.PI) % 360 + 540) % 360 - 180;
  const latDeg = 90 - TH[i] * 180 / Math.PI;
  LAND[i] = isLandLatLon(latDeg, lonDeg) ? 1 : 0;
}

const CORNERS = ["tl","tr","bl","br"] as const;
interface Props { width?: number; height?: number }

export default function HologramGlobe({ width = 360, height = 360 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = width, H = height;
    const R  = Math.min(W, H) * 0.44;
    const CX = W / 2, CY = H / 2;

    let t = 0, scanY = 0, raf = 0;

    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      t += 0.012 * dt; scanY = (scanY + 0.85 * dt) % (H + 30);
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

      // Land: 12-bucket smooth depth shading (back→front, painter's order)
      for (let b = 0; b < N_BUCKETS; b++) {
        const r = B_R[b];
        ctx.beginPath();
        for (let i = 0; i < N_PTS; i++) {
          if (!LAND[i]) continue;
          let bi = ((pdz[i] + 1) * 0.5 * N_BUCKETS) | 0;
          if (bi < 0) bi = 0; else if (bi >= N_BUCKETS) bi = N_BUCKETS - 1;
          if (bi !== b) continue;
          ctx.moveTo(px[i] + r, py[i]);
          ctx.arc(px[i], py[i], r, 0, PI2);
        }
        ctx.fillStyle = B_A[b];
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

      if (running) raf = requestAnimationFrame(draw);
    };

    // Reduced motion: bitta statik kadr, loop yo'q
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let running = !reduced;
    const io = new IntersectionObserver(([entry]) => {
      const vis = entry.isIntersecting;
      if (vis && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(draw); }
      else if (!vis && running) { running = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.05 });
    if (!reduced) io.observe(canvas);

    raf = requestAnimationFrame(draw);
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); };
  }, [width, height]);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: width, aspectRatio: `${width} / ${height}`, display: "inline-block" }}>
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
        display: "block", width: "100%", height: "100%",
        clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)",
        filter: "drop-shadow(0 0 18px rgba(255,0,53,0.32))",
      }} />
      <div style={{ position:"absolute", left:0, right:0, height:28, background:"linear-gradient(transparent,rgba(255,0,53,0.09),transparent)", animation:"hologram-scan 3.5s linear infinite", pointerEvents:"none", zIndex:3 }} />
      <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", zIndex:4, fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.22em", color:"rgba(255,0,53,0.4)", whiteSpace:"nowrap" }}>◆ EARTH · SCAN ◆</div>
    </div>
  );
}
