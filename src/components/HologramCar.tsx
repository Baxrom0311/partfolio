"use client";
import { useEffect, useRef } from "react";
import { CAR_DOTS, N_EDGE, WHEELS } from "@/lib/carDots";

/* Anime speed scene — red dot-matrix car (Openclipart Skoda Superb, CC0)
   racing right: smoke trail, speed lines, scrolling road. Pure Canvas 2D. */

const N_DOTS = CAR_DOTS.length / 2;

// Lowest car-local y (for road placement)
let _minY = 1;
for (let i = 1; i < CAR_DOTS.length; i += 2) if (CAR_DOTS[i] < _minY) _minY = CAR_DOTS[i];
const MIN_Y = _minY;

// Per-frame screen-position buffers — pre-allocated, zero GC pressure
const SX = new Float32Array(N_DOTS);
const SY = new Float32Array(N_DOTS);

// Smoke particle pool (130) — Float32Arrays, reused forever
const SM_N = 130;
const SM_X = new Float32Array(SM_N);
const SM_Y = new Float32Array(SM_N);
const SM_VX = new Float32Array(SM_N);
const SM_VY = new Float32Array(SM_N);
const SM_LIFE = new Float32Array(SM_N);   // frames remaining; <=0 → dead
const SM_MAX = new Float32Array(SM_N);
const SM_COL = new Uint8Array(SM_N);      // 0 = red (70%), 1 = grey (30%)

// Smoke styles: 2 colors × 4 alpha buckets (alpha = 0.30 * t^1.5)
const SM_STYLES: string[][] = [[], []];
for (let b = 0; b < 4; b++) {
  const a = (0.30 * Math.pow((b + 0.5) / 4, 1.5)).toFixed(3);
  SM_STYLES[0].push("rgba(255,45,53," + a + ")");
  SM_STYLES[1].push("rgba(200,200,205," + a + ")");
}

// Speed lines (10) — parallel arrays, prebuilt alpha styles
const SL_N = 10;
const SL_X = new Float32Array(SL_N);
const SL_Y = new Float32Array(SL_N);
const SL_LEN = new Float32Array(SL_N);
const SL_SPD = new Float32Array(SL_N);
const SL_STYLE = new Uint8Array(SL_N);
const SL_STYLES = ["rgba(255,45,53,0.05)", "rgba(255,45,53,0.09)", "rgba(255,45,53,0.12)", "rgba(255,45,53,0.16)"];

const ROAD_DASH = [26, 20];
const NO_DASH: number[] = [];

const CORNERS = ["tl", "tr", "bl", "br"] as const;
interface Props { width?: number; height?: number }

export default function HologramCar({ width = 580, height = 340 }: Props) {
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

    const ne = Math.min(W, H) * 0.40;
    const CX = W * 0.54, CY = H * 0.46;
    const roadY = CY - MIN_Y * ne + 4;
    const rearX = CX + (-1.15) * ne;

    // Init speed lines scattered across the canvas
    for (let i = 0; i < SL_N; i++) {
      SL_X[i] = Math.random() * W;
      SL_Y[i] = Math.random() * H;
      SL_LEN[i] = 30 + Math.random() * 90;
      SL_SPD[i] = 9 + Math.random() * 7;
      SL_STYLE[i] = (Math.random() * 4) | 0;
    }
    SM_LIFE.fill(0);

    let time = 0, scanY = 0, raf = 0, frame = 0;
    let roadOff = 0, roadOff2 = 0, wheelAng = 0, smokeAcc = 0;
    let glitchFrames = 0, glitchY = 0, glitchH = 0, glitchOff = 0;

    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      time += dt;
      frame++;
      scanY = (scanY + 0.90 * dt) % (H + 30);
      ctx.clearRect(0, 0, W, H);

      const bob = Math.sin(time * 0.13) * 1.1;
      const shakeX = (Math.random() - 0.5) * 1.0;
      const shakeY = (Math.random() - 0.5) * 0.6;

      // ---- Rear glow (taillight bloom, behind everything) ----
      const rg = ctx.createRadialGradient(rearX + 6, CY + bob, 0, rearX + 6, CY + bob, ne * 0.55);
      rg.addColorStop(0, "rgba(255,0,53,0.10)"); rg.addColorStop(1, "transparent");
      ctx.fillStyle = rg; ctx.fillRect(rearX - ne * 0.6, CY - ne * 0.5, ne * 1.2, ne);

      // ---- Road: two dashed rows scrolling left (parallax) ----
      roadOff += 7 * dt;
      roadOff2 += 4 * dt;
      ctx.setLineDash(ROAD_DASH);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,45,53,0.25)";
      ctx.lineDashOffset = roadOff;
      ctx.beginPath(); ctx.moveTo(0, roadY); ctx.lineTo(W, roadY); ctx.stroke();
      ctx.strokeStyle = "rgba(255,45,53,0.10)";
      ctx.lineDashOffset = roadOff2;
      ctx.beginPath(); ctx.moveTo(0, roadY + 8); ctx.lineTo(W, roadY + 8); ctx.stroke();
      ctx.setLineDash(NO_DASH);

      // ---- Speed lines: 1px horizontal streaks flying left ----
      for (let i = 0; i < SL_N; i++) {
        SL_X[i] -= SL_SPD[i] * dt;
        if (SL_X[i] + SL_LEN[i] < 0) {
          SL_X[i] = W + Math.random() * 40;
          SL_Y[i] = Math.random() * H;
          SL_LEN[i] = 30 + Math.random() * 90;
          SL_SPD[i] = 9 + Math.random() * 7;
          SL_STYLE[i] = (Math.random() * 4) | 0;
        }
        ctx.fillStyle = SL_STYLES[SL_STYLE[i]];
        ctx.fillRect(SL_X[i], SL_Y[i], SL_LEN[i], 1);
      }

      // ---- Smoke trail: spawn 3–4/frame from rear-lower, update pool ----
      smokeAcc += (3 + Math.random()) * dt;
      let toSpawn = smokeAcc | 0;
      smokeAcc -= toSpawn;
      for (let i = 0; i < SM_N && toSpawn > 0; i++) {
        if (SM_LIFE[i] > 0) continue;
        SM_X[i] = rearX + ne * 0.023 + (Math.random() - 0.5) * 12;
        SM_Y[i] = roadY - 3 + (Math.random() - 0.5) * 12;
        SM_VX[i] = -(2.2 + Math.random() * 1.4);
        SM_VY[i] = -(0.2 + Math.random() * 0.5);
        SM_MAX[i] = 50 + Math.random() * 10;
        SM_LIFE[i] = SM_MAX[i];
        SM_COL[i] = Math.random() < 0.7 ? 0 : 1;
        toSpawn--;
      }
      for (let i = 0; i < SM_N; i++) {
        if (SM_LIFE[i] <= 0) continue;
        SM_LIFE[i] -= dt;
        SM_X[i] += SM_VX[i] * dt;
        SM_Y[i] += SM_VY[i] * dt;
      }
      // Batched fills: color × alpha-bucket groups
      for (let c = 0; c < 2; c++) {
        for (let b = 0; b < 4; b++) {
          ctx.beginPath();
          let any = false;
          for (let i = 0; i < SM_N; i++) {
            if (SM_LIFE[i] <= 0 || SM_COL[i] !== c) continue;
            const t = SM_LIFE[i] / SM_MAX[i];          // 1 → fresh, 0 → dead
            if (Math.min((t * 4) | 0, 3) !== b) continue;
            const r = 1.5 + 5.5 * (1 - t);
            ctx.moveTo(SM_X[i] + r, SM_Y[i]);
            ctx.arc(SM_X[i], SM_Y[i], r, 0, 6.2832);
            any = true;
          }
          if (!any) continue;
          ctx.fillStyle = SM_STYLES[c][b];
          ctx.fill();
        }
      }

      // ---- Glitch slice: every ~2.5s shift a horizontal band for 3 frames ----
      if (glitchFrames <= 0 && Math.random() < 0.0067 * dt) {
        glitchFrames = 3;
        glitchY = CY - ne * 0.4 + Math.random() * ne * 0.7;
        glitchH = 10 + Math.random() * 10;
        glitchOff = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 3);
      }
      const gActive = glitchFrames > 0;
      if (gActive) glitchFrames -= dt;

      // ---- Car dots: project once, then batched passes ----
      for (let i = 0; i < N_DOTS; i++) {
        let x = CX + CAR_DOTS[i * 2] * ne + shakeX;
        const y = CY - CAR_DOTS[i * 2 + 1] * ne + bob + shakeY;
        if (gActive && y >= glitchY && y <= glitchY + glitchH) x += glitchOff;
        SX[i] = x;
        SY[i] = y;
      }
      // Interior dots (edge dots come FIRST in the array)
      ctx.fillStyle = "rgba(255,45,53,0.55)";
      for (let i = N_EDGE; i < N_DOTS; i++) ctx.fillRect(SX[i] - 0.7, SY[i] - 0.7, 1.4, 1.4);
      // Edge dots, brighter, on top
      ctx.fillStyle = "rgba(255,45,53,0.95)";
      for (let i = 0; i < N_EDGE; i++) ctx.fillRect(SX[i] - 0.85, SY[i] - 0.85, 1.7, 1.7);
      // Shimmer: ~4% of dots flash white-red (cheap hash, no allocation)
      ctx.fillStyle = "rgba(255,120,126,0.9)";
      const fh = frame * 97;
      for (let i = 0; i < N_DOTS; i++) {
        if (((Math.imul(i, 2654435761) + fh) >>> 0) % 100 < 4) {
          ctx.fillRect(SX[i] - 0.85, SY[i] - 0.85, 1.7, 1.7);
        }
      }

      // ---- Wheels: spinning alloy discs (rim + 5 double spokes + hub) ----
      wheelAng += 0.45 * dt; // canvas y-down: clockwise = rolling right
      for (let w = 0; w < WHEELS.length; w++) {
        const wx = CX + WHEELS[w][0] * ne + shakeX;
        const wy = CY - WHEELS[w][1] * ne + bob + shakeY;
        const wr = WHEELS[w][2] * ne; // tuned disc radius (baked into carDots)
        // Tire edge (motion-blur ring)
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,45,53,0.18)";
        ctx.lineWidth = 1.5;
        ctx.arc(wx, wy, wr, 0, 6.2832);
        ctx.stroke();
        // Rim (disk chegarasi) — sport g'ildirakda shinaning ~72%
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,90,96,0.85)";
        ctx.lineWidth = 1.6;
        ctx.arc(wx, wy, wr * 0.72, 0, 6.2832);
        ctx.stroke();
        // Inner detail ring
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,45,53,0.30)";
        ctx.lineWidth = 1;
        ctx.arc(wx, wy, wr * 0.35, 0, 6.2832);
        ctx.stroke();
        // 5 double spokes (Y-alloy look), rotating
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,90,96,0.75)";
        ctx.lineWidth = 1.8;
        for (let k = 0; k < 5; k++) {
          const a0 = wheelAng + k * 1.2566;
          for (const off of [-0.07, 0.07]) {
            const ai = a0 + off * 2.2; // spoke splits near the rim
            ctx.moveTo(wx + Math.cos(a0 + off) * wr * 0.14, wy + Math.sin(a0 + off) * wr * 0.14);
            ctx.lineTo(wx + Math.cos(ai) * wr * 0.66, wy + Math.sin(ai) * wr * 0.66);
          }
        }
        ctx.stroke();
        // Hub
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,45,53,0.9)";
        ctx.arc(wx, wy, wr * 0.11, 0, 6.2832);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,160,164,0.95)";
        ctx.arc(wx, wy, wr * 0.04, 0, 6.2832);
        ctx.fill();
      }

      // ---- Taillight streaks: two short lines trailing left off the rear ----
      ctx.strokeStyle = "rgba(255,30,40,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const tlY = CY - ne * 0.06 + bob;
      ctx.moveTo(rearX + 2, tlY);        ctx.lineTo(rearX - 28, tlY);
      ctx.moveTo(rearX + 4, tlY + 7);    ctx.lineTo(rearX - 22, tlY + 7);
      ctx.stroke();

      // ---- Scan line ----
      const sg = ctx.createLinearGradient(0, scanY - 22, 0, scanY + 3);
      sg.addColorStop(0, "transparent"); sg.addColorStop(1, "rgba(255,0,53,0.09)");
      ctx.fillStyle = sg; ctx.fillRect(0, scanY - 22, W, 25);
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
        filter: "drop-shadow(0 0 18px rgba(255,0,53,0.30))",
      }} />
      <div style={{ position:"absolute", left:0, right:0, height:28, background:"linear-gradient(transparent,rgba(255,0,53,0.09),transparent)", animation:"hologram-scan 3.5s linear infinite", pointerEvents:"none", zIndex:3 }} />
      <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", zIndex:4, fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.22em", color:"rgba(255,0,53,0.4)", whiteSpace:"nowrap" }}>◆ VEHICLE · SCAN ◆</div>
    </div>
  );
}
