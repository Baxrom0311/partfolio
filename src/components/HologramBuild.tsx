"use client";
import { useEffect, useRef } from "react";

/* "Building a website" hologram — browser wireframe assembles block by block
   while a terminal below types the build log. Loops forever. Canvas 2D. */

const PI2 = Math.PI * 2;

interface Block { x: number; y: number; w: number; h: number; t0: number; dur: number }

const CORNERS = ["tl", "tr", "bl", "br"] as const;
interface Props { width?: number; height?: number }

export default function HologramBuild({ width = 440, height = 360 }: Props) {
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

    // ── Browser window geometry ──
    const bx = 14, by = 12, bw = W - 28, bh = H - 132;
    const cx = bx + 10, cy = by + 34, cw = bw - 20;

    const BLOCKS: Block[] = [
      { x: cx, y: cy, w: cw, h: 13, t0: 90, dur: 26 },                          // navbar
      { x: cx, y: cy + 24, w: cw * 0.52, h: 11, t0: 120, dur: 24 },             // title 1
      { x: cx, y: cy + 41, w: cw * 0.38, h: 11, t0: 145, dur: 24 },             // title 2
      { x: cx, y: cy + 60, w: cw * 0.26, h: 13, t0: 170, dur: 22 },             // button
      { x: cx + cw * 0.62, y: cy + 24, w: cw * 0.38, h: 49, t0: 195, dur: 26 }, // hero image
      { x: cx,             y: cy + 88, w: cw * 0.31, h: 42, t0: 225, dur: 24 }, // card 1
      { x: cx + cw * 0.345, y: cy + 88, w: cw * 0.31, h: 42, t0: 250, dur: 24 },// card 2
      { x: cx + cw * 0.69,  y: cy + 88, w: cw * 0.31, h: 42, t0: 275, dur: 24 },// card 3
    ];

    // ── Terminal geometry + build script ──
    const tx = 14, ty = H - 110, tw = W - 28, th = 96;
    const LINES = [
      { text: "$ npx create-next-app portfolio", t0: 6,   cps: 0.55, bright: false },
      { text: "▲ Compiling modules ...",     t0: 84,  cps: 0.8,  bright: false },
      { text: "",                                 t0: 140, cps: 0,    bright: false }, // progress row
      { text: "✓ Deployed → bakhrom.dev", t0: 310, cps: 0.6, bright: true },
    ];
    const PROG_T0 = 140, PROG_T1 = 300;
    const LOOP = 440, FADE = 26;

    const ease = (p: number) => 1 - Math.pow(1 - p, 3);

    let t = 0, scanY = 0, raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      t += dt;
      scanY = (scanY + 0.8 * dt) % (H + 30);
      if (t > LOOP + FADE) t = 0;
      const fade = t > LOOP ? Math.max(0, 1 - (t - LOOP) / FADE) : 1;

      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = fade;

      // ── Browser frame ──
      ctx.strokeStyle = "rgba(255,45,53,0.55)";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw, bh);
      ctx.beginPath();
      ctx.moveTo(bx, by + 22); ctx.lineTo(bx + bw, by + 22);
      ctx.stroke();
      // traffic dots
      for (let d = 0; d < 3; d++) {
        ctx.beginPath();
        ctx.fillStyle = d === 0 ? "rgba(255,45,53,0.9)" : "rgba(255,45,53,0.35)";
        ctx.arc(bx + 12 + d * 12, by + 11, 3, 0, PI2);
        ctx.fill();
      }
      // url pill
      ctx.strokeStyle = "rgba(255,45,53,0.30)";
      ctx.strokeRect(bx + 52.5, by + 5.5, bw - 100, 11);
      ctx.fillStyle = "rgba(255,45,53,0.5)";
      ctx.font = "8px monospace";
      ctx.fillText("bakhrom.dev", bx + 58, by + 13.5);

      // ── Page blocks: dot-materialize + expanding outline ──
      for (const b of BLOCKS) {
        const p = t < b.t0 ? 0 : Math.min(1, (t - b.t0) / b.dur);
        if (p <= 0) continue;
        const e = ease(p);
        ctx.beginPath();
        for (let yy = b.y + 4; yy < b.y + b.h - 2; yy += 7)
          for (let xx = b.x + 4; xx < b.x + b.w * e - 2; xx += 7) {
            ctx.moveTo(xx + 1, yy);
            ctx.arc(xx, yy, 1, 0, PI2);
          }
        ctx.fillStyle = "rgba(255,45,53,0.30)";
        ctx.fill();
        ctx.strokeStyle = `rgba(255,45,53,${(0.25 + 0.55 * e).toFixed(3)})`;
        ctx.strokeRect(b.x + 0.5, b.y + 0.5, Math.max(2, b.w * e), b.h);
      }

      // ── Data packets: terminal → building block ──
      const active = BLOCKS.find(b => t >= b.t0 && t < b.t0 + b.dur);
      if (active) {
        for (let k = 0; k < 3; k++) {
          const ph = ((t * 0.045) + k / 3) % 1;
          const sx0 = tx + 24, sy0 = ty + 12;
          const dx0 = active.x + active.w / 2, dy0 = active.y + active.h / 2;
          const px0 = sx0 + (dx0 - sx0) * ph;
          const py0 = sy0 + (dy0 - sy0) * ph - Math.sin(ph * Math.PI) * 26;
          ctx.fillStyle = `rgba(255,90,96,${(0.8 * (1 - ph * 0.5)).toFixed(3)})`;
          ctx.fillRect(px0 - 1.5, py0 - 1.5, 3, 3);
        }
      }

      // ── Deploy flash ──
      if (t > 308 && t < 320) {
        ctx.fillStyle = `rgba(255,255,255,${((320 - t) / 12 * 0.12).toFixed(3)})`;
        ctx.fillRect(bx, by, bw, bh);
      }

      // ── Terminal ──
      ctx.strokeStyle = "rgba(255,45,53,0.55)";
      ctx.strokeRect(tx + 0.5, ty + 0.5, tw, th);
      ctx.beginPath();
      ctx.moveTo(tx, ty + 16); ctx.lineTo(tx + tw, ty + 16);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,45,53,0.5)";
      ctx.font = "8px monospace";
      ctx.fillText("TERMINAL — build", tx + 8, ty + 11);

      ctx.font = "10px monospace";
      let lastLineEnd: { x: number; y: number } | null = null;
      for (let li = 0; li < LINES.length; li++) {
        const L = LINES[li];
        if (t < L.t0) break;
        const ly = ty + 32 + li * 17;

        if (li === 2) {
          // progress bar row
          const pp = Math.min(1, Math.max(0, (t - PROG_T0) / (PROG_T1 - PROG_T0)));
          ctx.fillStyle = "rgba(255,45,53,0.75)";
          ctx.fillText("BUILD", tx + 10, ly);
          const bx0 = tx + 56, bw0 = tw - 120;
          ctx.strokeStyle = "rgba(255,45,53,0.4)";
          ctx.strokeRect(bx0 + 0.5, ly - 8.5, bw0, 10);
          ctx.fillStyle = "rgba(255,45,53,0.55)";
          ctx.fillRect(bx0 + 2, ly - 6.5, (bw0 - 4) * pp, 6);
          ctx.fillStyle = "rgba(255,45,53,0.75)";
          ctx.fillText(`${Math.round(pp * 100)}%`, bx0 + bw0 + 8, ly);
          lastLineEnd = null;
          continue;
        }

        const nChars = L.cps === 0 ? L.text.length : Math.min(L.text.length, Math.floor((t - L.t0) * L.cps));
        const shown = L.text.slice(0, nChars);
        ctx.fillStyle = L.bright ? "rgba(255,120,126,0.95)" : "rgba(255,45,53,0.75)";
        ctx.fillText(shown, tx + 10, ly);
        if (nChars < L.text.length || li === LINES.length - 1) {
          lastLineEnd = { x: tx + 10 + ctx.measureText(shown).width + 2, y: ly };
        }
      }
      // blinking cursor
      if (lastLineEnd && Math.floor(t / 16) % 2 === 0) {
        ctx.fillStyle = "rgba(255,90,96,0.9)";
        ctx.fillRect(lastLineEnd.x, lastLineEnd.y - 8, 6, 10);
      }

      ctx.globalAlpha = 1;

      // ── Scan line ──
      const sg = ctx.createLinearGradient(0, scanY - 22, 0, scanY + 3);
      sg.addColorStop(0, "transparent"); sg.addColorStop(1, "rgba(255,0,53,0.08)");
      ctx.fillStyle = sg; ctx.fillRect(0, scanY - 22, W, 25);

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
        filter: "drop-shadow(0 0 18px rgba(255,0,53,0.28))",
      }} />
      <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", zIndex:4, fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.22em", color:"rgba(255,0,53,0.4)", whiteSpace:"nowrap" }}>◆ BUILD · LIVE ◆</div>
    </div>
  );
}
