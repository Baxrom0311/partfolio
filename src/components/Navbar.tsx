"use client";
import { useState, useEffect } from "react";

const LINKS = [
  { label: "ABOUT",    href: "#about"    },
  { label: "PROJECTS", href: "#projects" },
  { label: "CONTACT",  href: "#contact"  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0,
        zIndex: 100, height: 60,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        background: scrolled ? "rgba(0,0,0,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,0,53,0.25)" : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      {/* Logo */}
      <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          className="p5-skew"
          style={{ background: "var(--red)", boxShadow: "0 0 20px rgba(255,0,53,0.5)" }}
        >
          <span
            className="p5-skew-inner"
            style={{
              fontFamily: "var(--font-bebas)", fontSize: 20,
              color: "#fff", padding: "4px 14px", display: "block",
              letterSpacing: "0.05em",
            }}
          >
            B
          </span>
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          fontWeight: 700, letterSpacing: "0.2em", color: "#fff",
        }}>
          BAKHROM
        </span>
      </a>

      {/* Desktop */}
      <nav className="hidden md:flex" style={{ alignItems: "center", gap: 32 }}>
        {LINKS.map(l => (
          <a
            key={l.href} href={l.href}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              fontWeight: 700, letterSpacing: "0.18em",
              color: "var(--muted)", textDecoration: "none",
              transition: "color 0.2s",
              position: "relative",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--muted)";
            }}
          >
            {l.label}
          </a>
        ))}
        <a href="#contact" className="p5-btn p5-btn-red" style={{ boxShadow: "0 0 20px rgba(255,0,53,0.35)" }}>
          <span className="p5-btn-inner">ALOQA →</span>
        </a>
      </nav>

      {/* Mobile burger */}
      <button
        className="md:hidden"
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: "none",
          fontFamily: "var(--font-mono)", fontSize: 11,
          fontWeight: 700, letterSpacing: "0.15em", color: "var(--red)",
        }}
      >
        {open ? "✕" : "MENU"}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: 60, left: 0, right: 0,
          background: "rgba(0,0,0,0.97)",
          borderBottom: "1px solid rgba(255,0,53,0.2)",
          padding: "16px 40px 24px",
        }}>
          {LINKS.map(l => (
            <a
              key={l.href} href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block", padding: "12px 0",
                fontFamily: "var(--font-bebas)", fontSize: 26,
                letterSpacing: "0.08em", color: "#fff",
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,0,53,0.1)",
              }}
            >
              ◆ {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
