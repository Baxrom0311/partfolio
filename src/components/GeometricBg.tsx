"use client";
import { useEffect, useRef } from "react";

type Shape = {
  x: number; y: number; vx: number; vy: number;
  size: number; rot: number; rotV: number;
  type: "circle" | "triangle" | "diamond" | "rect";
  alpha: number;
};

export default function GeometricBg() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, raf: number;
    const shapes: Shape[] = [];
    const types = ["circle", "triangle", "diamond", "rect"] as const;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 18; i++) {
      shapes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 70 + 18,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.004,
        type: types[Math.floor(Math.random() * types.length)],
        alpha: Math.random() * 0.055 + 0.015,
      });
    }

    const drawShape = (s: Shape) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = s.alpha;
      ctx.strokeStyle = "#FF0035";
      ctx.lineWidth = 1;
      ctx.beginPath();

      if (s.type === "circle") {
        ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
      } else if (s.type === "triangle") {
        const h = s.size * 0.866;
        ctx.moveTo(0, -h * 0.667);
        ctx.lineTo(s.size / 2,  h * 0.333);
        ctx.lineTo(-s.size / 2, h * 0.333);
        ctx.closePath();
      } else if (s.type === "diamond") {
        ctx.moveTo(0, -s.size / 2);
        ctx.lineTo(s.size * 0.35, 0);
        ctx.lineTo(0,  s.size / 2);
        ctx.lineTo(-s.size * 0.35, 0);
        ctx.closePath();
      } else {
        ctx.rect(-s.size / 2, -s.size / 2, s.size, s.size);
      }

      ctx.stroke();
      ctx.restore();
    };

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;

      for (const s of shapes) {
        s.x += s.vx; s.y += s.vy; s.rot += s.rotV;
        if (s.x < -100) s.x = W + 100;
        if (s.x > W + 100) s.x = -100;
        if (s.y < -100) s.y = H + 100;
        if (s.y > H + 100) s.y = -100;
        drawShape(s);
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}
