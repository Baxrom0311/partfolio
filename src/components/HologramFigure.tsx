"use client";
import { useEffect, useRef } from "react";

// Body regions [cx, cy, rx, ry, count] — normalised 0-1
const REGIONS: [number, number, number, number, number][] = [
  [0.50, 0.095, 0.105, 0.098, 55], // head
  [0.50, 0.210, 0.038, 0.045, 14], // neck
  [0.50, 0.275, 0.265, 0.052, 36], // shoulders
  [0.50, 0.355, 0.195, 0.085, 58], // upper chest
  [0.50, 0.455, 0.175, 0.080, 52], // mid torso
  [0.50, 0.548, 0.200, 0.062, 44], // waist/hips
  [0.21, 0.370, 0.058, 0.105, 26], // left upper arm
  [0.15, 0.530, 0.044, 0.092, 20], // left forearm
  [0.79, 0.370, 0.058, 0.105, 26], // right upper arm
  [0.85, 0.530, 0.044, 0.092, 20], // right forearm
  [0.39, 0.665, 0.078, 0.100, 36], // left thigh
  [0.37, 0.840, 0.057, 0.090, 28], // left shin
  [0.61, 0.665, 0.078, 0.100, 36], // right thigh
  [0.63, 0.840, 0.057, 0.090, 28], // right shin
];
// total ≈ 479 figure points + 40 ambient = ~519

function fillEllipse(cx: number, cy: number, rx: number, ry: number, n: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random());
    pts.push([cx + r * Math.cos(a) * rx, cy + r * Math.sin(a) * ry]);
  }
  return pts;
}

const PI2 = Math.PI * 2;

interface Props { width?: number; height?: number }

export default function HologramFigure({ width = 260, height = 360 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = width, H = height;
    canvas.width  = W;
    canvas.height = H;

    // ── particles ───────────────────────────────────────────────────
    interface P { bx: number; by: number; ph: number; amb: boolean }
    const parts: P[] = [];

    REGIONS.forEach(([cx, cy, rx, ry, n]) =>
      fillEllipse(cx, cy, rx, ry, n).forEach(([bx, by], i) =>
        parts.push({ bx, by, ph: (parts.length * 0.37 + i * 0.11) % PI2, amb: false })
      )
    );
    for (let i = 0; i < 40; i++)
      parts.push({ bx: 0.05 + Math.random() * 0.9, by: 0.05 + Math.random() * 0.9,
        ph: Math.random() * PI2, amb: true });

    const N   = parts.length;
    const px  = new Float32Array(N);
    const py  = new Float32Array(N);

    // ── spatial grid ─────────────────────────────────────────────────
    const CDIST = 22;                            // connection distance px
    const COLS  = Math.ceil(W / CDIST);
    const ROWS  = Math.ceil(H / CDIST);
    const CD2   = CDIST * CDIST;

    let t     = 0;
    let scanY = 0;
    let raf: number;

    const draw = () => {
      t     += 0.013;
      scanY  = (scanY + 1.2) % (H + 40);
      ctx.clearRect(0, 0, W, H);

      // update positions
      for (let i = 0; i < N; i++) {
        const p = parts[i];
        const d = p.amb ? 0.022 : 0.011;
        px[i] = (p.bx + Math.sin(t * 0.6  + p.ph)       * d) * W;
        py[i] = (p.by + Math.cos(t * 0.5  + p.ph + 1.1) * d) * H;
      }

      // build grid
      const grid: number[][] = Array.from({ length: COLS * ROWS }, () => []);
      for (let i = 0; i < N; i++) {
        const cx = Math.min(COLS - 1, Math.max(0, px[i] / CDIST | 0));
        const cy = Math.min(ROWS - 1, Math.max(0, py[i] / CDIST | 0));
        grid[cy * COLS + cx].push(i);
      }

      // ── LINES: two passes (bright close, dim far) — NO shadowBlur ──
      const closeLines: number[] = [];   // [x1,y1,x2,y2, ...]
      const farLines:   number[] = [];

      for (let cy = 0; cy < ROWS; cy++) {
        for (let cx = 0; cx < COLS; cx++) {
          const cell = grid[cy * COLS + cx];
          if (!cell.length) continue;

          const nb: number[][] = [cell];
          if (cx + 1 < COLS) nb.push(grid[cy * COLS + cx + 1]);
          if (cy + 1 < ROWS) {
            nb.push(grid[(cy + 1) * COLS + cx]);
            if (cx + 1 < COLS) nb.push(grid[(cy + 1) * COLS + cx + 1]);
            if (cx - 1 >= 0)   nb.push(grid[(cy + 1) * COLS + cx - 1]);
          }

          for (let a = 0; a < cell.length; a++) {
            const i = cell[a];
            for (let ni = 0; ni < nb.length; ni++) {
              const nbArr = nb[ni];
              const start = nbArr === cell ? a + 1 : 0;
              for (let b = start; b < nbArr.length; b++) {
                const j  = nbArr[b];
                const dx = px[i] - px[j];
                const dy = py[i] - py[j];
                const d2 = dx * dx + dy * dy;
                if (d2 >= CD2) continue;
                const bucket = d2 < CD2 * 0.3 ? closeLines : farLines;
                bucket.push(px[i], py[i], px[j], py[j]);
              }
            }
          }
        }
      }

      // draw close lines
      if (closeLines.length) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,0,53,0.55)";
        ctx.lineWidth   = 0.8;
        for (let i = 0; i < closeLines.length; i += 4) {
          ctx.moveTo(closeLines[i], closeLines[i + 1]);
          ctx.lineTo(closeLines[i + 2], closeLines[i + 3]);
        }
        ctx.stroke();
      }
      // draw far lines
      if (farLines.length) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,0,53,0.22)";
        ctx.lineWidth   = 0.5;
        for (let i = 0; i < farLines.length; i += 4) {
          ctx.moveTo(farLines[i], farLines[i + 1]);
          ctx.lineTo(farLines[i + 2], farLines[i + 3]);
        }
        ctx.stroke();
      }

      // ── DOTS: batch — glow ring + core (NO shadowBlur) ─────────────
      const figFill = [] as number[];
      const ambFill = [] as number[];
      for (let i = 0; i < N; i++)
        (parts[i].amb ? ambFill : figFill).push(px[i], py[i]);

      // figure dot glow ring (larger, transparent)
      ctx.beginPath();
      for (let i = 0; i < figFill.length; i += 2) {
        ctx.moveTo(figFill[i] + 3.5, figFill[i + 1]);
        ctx.arc(figFill[i], figFill[i + 1], 3.5, 0, PI2);
      }
      ctx.fillStyle = "rgba(255,0,53,0.12)";
      ctx.fill();

      // figure dot core
      ctx.beginPath();
      for (let i = 0; i < figFill.length; i += 2) {
        ctx.moveTo(figFill[i] + 1.6, figFill[i + 1]);
        ctx.arc(figFill[i], figFill[i + 1], 1.6, 0, PI2);
      }
      ctx.fillStyle = "rgba(255,50,53,0.9)";
      ctx.fill();

      // ambient dots
      ctx.beginPath();
      for (let i = 0; i < ambFill.length; i += 2) {
        ctx.moveTo(ambFill[i] + 1.2, ambFill[i + 1]);
        ctx.arc(ambFill[i], ambFill[i + 1], 1.2, 0, PI2);
      }
      ctx.fillStyle = "rgba(255,0,53,0.28)";
      ctx.fill();

      // ── SCAN LINE ───────────────────────────────────────────────────
      const sg = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 3);
      sg.addColorStop(0, "transparent");
      sg.addColorStop(1, "rgba(255,0,53,0.10)");
      ctx.fillStyle = sg;
      ctx.fillRect(0, scanY - 30, W, 33);

      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,0,53,0.50)";
      ctx.lineWidth   = 1;
      ctx.moveTo(0,  scanY);
      ctx.lineTo(W, scanY);
      ctx.stroke();

      // ── RADIAL GLOW overlay ────────────────────────────────────────
      const rg = ctx.createRadialGradient(W / 2, H * 0.44, H * 0.1, W / 2, H * 0.44, H * 0.7);
      rg.addColorStop(0, "transparent");
      rg.addColorStop(1, "rgba(255,0,53,0.07)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);

      // flicker
      if (Math.random() < 0.012) {
        ctx.fillStyle = "rgba(255,0,53,0.04)";
        ctx.fillRect(0, 0, W, H);
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {(["tl","tr","bl","br"] as const).map(c => (
        <div key={c} style={{
          position: "absolute",
          top:    c[0]==="t" ? 0 : "auto", bottom: c[0]==="b" ? 0 : "auto",
          left:   c[1]==="l" ? 0 : "auto", right:  c[1]==="r" ? 0 : "auto",
          width: 14, height: 14,
          borderTop:    c[0]==="t" ? "1.5px solid rgba(255,0,53,0.65)" : "none",
          borderBottom: c[0]==="b" ? "1.5px solid rgba(255,0,53,0.65)" : "none",
          borderLeft:   c[1]==="l" ? "1.5px solid rgba(255,0,53,0.65)" : "none",
          borderRight:  c[1]==="r" ? "1.5px solid rgba(255,0,53,0.65)" : "none",
        }} />
      ))}
      <canvas
        ref={canvasRef}
        style={{
          display: "block", width, height,
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
          filter: "drop-shadow(0 0 16px rgba(255,0,53,0.3))",
        }}
      />
      <div style={{
        position: "absolute", bottom: 8, left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "var(--font-mono)", fontSize: 8,
        letterSpacing: "0.22em", color: "rgba(255,0,53,0.4)",
        whiteSpace: "nowrap",
      }}>
        ◆ HOLOGRAM · ID ◆
      </div>
    </div>
  );
}
