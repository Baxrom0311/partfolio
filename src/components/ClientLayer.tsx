"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const GeometricBg = dynamic(() => import("./GeometricBg"), { ssr: false });
const Cursor      = dynamic(() => import("./Cursor"),      { ssr: false });

function ScrollBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const el  = document.documentElement;
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight) * 100;
      if (barRef.current) barRef.current.style.width = pct + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0,
      width: "100%", height: 2,
      background: "rgba(255,0,53,0.12)",
      zIndex: 10000, pointerEvents: "none",
    }}>
      <div ref={barRef} style={{
        height: "100%", width: "0%",
        background: "#FF0035",
        boxShadow: "0 0 8px #FF0035, 0 0 2px #FF0035",
        transition: "width 0.08s linear",
      }} />
    </div>
  );
}

export default function ClientLayer() {
  return (
    <>
      <ScrollBar />
      <Cursor />
      <GeometricBg />
    </>
  );
}
