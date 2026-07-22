"use client";
import { useEffect, useRef } from "react";

const TRAIL_LEN = 16;

interface Particle { x: number; y: number; vx: number; vy: number; r: number; alpha: number }
interface Slash {
  x1: number; y1: number; x2: number; y2: number;
  progress: number;   // 0 → 1 sweep
  fadeAlpha: number;  // fade out after sweep completes
  sparks: Particle[];
  done: boolean;
}

export default function Cursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener("resize", onResize);

    const trail: { x: number; y: number }[] = [];
    let mx = -200, my = -200, isHover = false;
    let splashes: Particle[] = [];
    let slashes:  Slash[]    = [];
    let raf: number;

    // ── helpers ─────────────────────────────────────────────────────────────
    /**
     * Draw a tapered blade shape along the slash from normalised position
     * [fromT … toT] (0 = start, 1 = end of full slash).
     * Width at each sample = sin(t·π) · maxW  →  thin–fat–thin profile.
     */
    const bladeFill = (
      s: Slash,
      fromT: number, toT: number,
      maxW: number, alpha: number,
      glowBlur: number, bright = false,
    ) => {
      const { x1, y1, x2, y2 } = s;
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 1 || toT <= fromT) return;

      const nx = (x2 - x1) / len, ny = (y2 - y1) / len;
      const px = -ny,             py = nx;            // perpendicular

      const N   = 36;
      const top: [number, number][] = [];
      const bot: [number, number][] = [];

      for (let i = 0; i <= N; i++) {
        const t  = fromT + (toT - fromT) * (i / N);
        const x  = x1 + (x2 - x1) * t;
        const y  = y1 + (y2 - y1) * t;
        const w  = Math.sin(t * Math.PI) * maxW;
        top.push([x + px * w, y + py * w]);
        bot.push([x - px * w, y - py * w]);
      }

      ctx.save();
      ctx.fillStyle   = bright ? `rgba(255,245,245,${alpha})` : `rgba(255,0,53,${alpha})`;
      ctx.shadowColor = "#FF0035";
      ctx.shadowBlur  = glowBlur;
      ctx.beginPath();
      ctx.moveTo(top[0][0], top[0][1]);
      top.forEach(pt => ctx.lineTo(pt[0], pt[1]));
      for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // ── slash drawing ────────────────────────────────────────────────────────
    const drawSlash = (s: Slash) => {
      const SPEED = 0.07;

      if (s.progress < 1) {
        s.progress = Math.min(1, s.progress + SPEED);
        const p = s.progress;

        // ghost afterimages — slightly behind the tip, more transparent
        bladeFill(s, 0, Math.max(0, p - 0.14), 9,  0.12, 6);
        bladeFill(s, 0, Math.max(0, p - 0.07), 10, 0.28, 10);

        // main blade
        bladeFill(s, 0, p, 11, 0.88, 24);
        // bright inner core (thinner)
        bladeFill(s, 0, p, 2.5, 0.75, 6, true);

        // leading-edge glow dot
        const hx = s.x1 + (s.x2 - s.x1) * p;
        const hy = s.y1 + (s.y2 - s.y1) * p;
        ctx.save();
        ctx.fillStyle   = "rgba(255,255,255,0.95)";
        ctx.shadowColor = "#FF0035";
        ctx.shadowBlur  = 32;
        ctx.beginPath();
        ctx.arc(hx, hy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else {
        // fade the completed slash out
        s.fadeAlpha *= 0.87;
        if (s.fadeAlpha > 0.015) {
          bladeFill(s, 0, 1, 11, s.fadeAlpha * 0.85, 20);
          bladeFill(s, 0, 1, 2.5, s.fadeAlpha * 0.65, 5, true);
        }

        // sparks
        s.sparks = s.sparks.filter(sp => sp.alpha > 0.02);
        s.sparks.forEach(sp => {
          sp.x += sp.vx; sp.y += sp.vy;
          sp.vy += 0.15; sp.alpha *= 0.9; sp.r *= 0.96;
          ctx.save();
          ctx.fillStyle   = `rgba(255,0,53,${sp.alpha})`;
          ctx.shadowColor = "#FF0035";
          ctx.shadowBlur  = 10;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        if (s.fadeAlpha <= 0.015 && s.sparks.length === 0) s.done = true;
      }
    };

    // ── event handlers ───────────────────────────────────────────────────────
    const onMove  = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onClick = (e: MouseEvent) => {
      for (let i = 0; i < 14; i++) {
        const a = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
        const s = 2.5 + Math.random() * 4;
        splashes.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 2 + Math.random() * 2.5, alpha: 1 });
      }
    };

    const triggerSlash = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width < 6) return;

      const pad  = 14;
      const midY = rect.top + rect.height / 2;
      const dy   = rect.height * 0.18;   // slight diagonal

      const sparks: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        const a = -Math.PI / 6 + (Math.random() - 0.5) * 1.4;
        const spd = 2 + Math.random() * 5.5;
        sparks.push({ x: rect.right + pad, y: midY + dy, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 1, r: 1.5 + Math.random() * 2.5, alpha: 1 });
      }

      slashes.push({ x1: rect.left - pad, y1: midY - dy, x2: rect.right + pad, y2: midY + dy, progress: 0, fadeAlpha: 1, sparks, done: false });
    };

    const onEnter = () => { isHover = true; };
    const onLeave = () => { isHover = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click",     onClick);
    window.addEventListener("mouseup",   triggerSlash);
    document.querySelectorAll("a, button").forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    // ── main loop ────────────────────────────────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // katana trail
      trail.push({ x: mx, y: my });
      if (trail.length > TRAIL_LEN) trail.shift();

      const hg = isHover ? 2.2 : 1;
      for (let i = 1; i < trail.length; i++) {
        const t     = i / trail.length;
        const alpha = Math.min(t * t * 0.9 * hg, 1);
        const width = t * (isHover ? 5 : 3.5);
        ctx.save();
        ctx.strokeStyle = isHover
          ? `rgba(255,${Math.floor(80 * (1 - t))},53,${alpha})`
          : `rgba(255,0,53,${alpha})`;
        ctx.lineWidth   = width;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.shadowColor = "#FF0035";
        ctx.shadowBlur  = isHover ? 18 + t * 14 : 8 + t * 10;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x,     trail[i].y);
        ctx.stroke();
        ctx.restore();
      }

      if (trail.length > 0) {
        const h = trail[trail.length - 1];
        ctx.save();
        ctx.fillStyle = "#FF0035"; ctx.shadowColor = "#FF0035"; ctx.shadowBlur = isHover ? 28 : 16;
        ctx.beginPath(); ctx.arc(h.x, h.y, isHover ? 4.5 : 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(h.x, h.y, isHover ? 1.8 : 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      splashes = splashes.filter(s => s.alpha > 0.02);
      splashes.forEach(s => {
        s.x += s.vx; s.y += s.vy; s.vy += 0.18; s.alpha *= 0.91; s.r *= 0.97;
        ctx.save();
        ctx.fillStyle = `rgba(255,0,53,${s.alpha})`; ctx.shadowColor = "#FF0035"; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      slashes = slashes.filter(s => !s.done);
      slashes.forEach(drawSlash);

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click",     onClick);
      window.removeEventListener("mouseup",   triggerSlash);
      window.removeEventListener("resize",    onResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }} />
  );
}
