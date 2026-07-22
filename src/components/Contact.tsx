"use client";
import { useEffect, useRef } from "react";

const CARDS = [
  { label: "EMAIL",  value: "bahromreyimberganov0311@gmail.com", href: "mailto:bahromreyimberganov0311@gmail.com", color: "var(--red)"  },
  { label: "GITHUB", value: "github.com/Baxrom0311",             href: "https://github.com/Baxrom0311",           color: "var(--cyan)" },
  { label: "PHONE",  value: "+998 93 558 0311",                  href: "tel:+998935580311",                       color: "var(--gold)" },
];

export default function Contact() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        const st = (t: string) => ({ scrollTrigger: { trigger: t, start: "top 85%" } });
        gsap.from(".ct-mark",  { opacity: 0, x: -40, duration: 0.7, ...st(".ct-mark") });
        gsap.from(".ct-line",  { clipPath: "inset(100% 0 0 0)", duration: 1, stagger: 0.12, ease: "power4.out", ...st(".ct-lines") });
        gsap.from(".ct-card",  { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ...st(".ct-cards") });
        gsap.from(".ct-cta",   { opacity: 0, y: 20, duration: 0.6, ...st(".ct-cta") });
      }, ref);
      return () => ctx.revert();
    };
    const c = init();
    return () => { c.then(fn => fn?.()); };
  }, []);

  return (
    <section
      ref={ref}
      id="contact"
      style={{
        padding: "120px 40px 80px",
        background: "#000",
        borderTop: "2px solid var(--red)",
        position: "relative", zIndex: 1,
        overflow: "hidden",
      }}
    >
      {/* Ghost text */}
      <div style={{
        position: "absolute", bottom: -40, right: -20,
        fontFamily: "var(--font-bebas)",
        fontSize: "clamp(120px, 22vw, 280px)", lineHeight: 1,
        WebkitTextStroke: "1px rgba(255,0,53,0.05)",
        color: "transparent", pointerEvents: "none",
        userSelect: "none", letterSpacing: "0.02em",
      }}>
        CONTACT
      </div>

      {/* Red diagonal glow */}
      <div style={{
        position: "absolute", left: 0, top: "30%",
        width: 250, height: "50%",
        background: "linear-gradient(90deg, rgba(255,0,53,0.08), transparent)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
        <div className="ct-mark ch-marker">
          <span className="ch-num">◆ 004</span>
          <span className="ch-sep" />
          <span className="ch-name">FINAL STAGE</span>
        </div>

        {/* Big text */}
        <div className="ct-lines" style={{ marginBottom: 64 }}>
          {[
            { t: "LET'S",     out: false },
            { t: "BUILD",     out: true  },
            { t: "SOMETHING", out: false },
          ].map((l, i) => (
            <div key={i} className="lw">
              <h2
                className="ct-line"
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "clamp(60px, 11vw, 124px)",
                  letterSpacing: "0.02em", lineHeight: 1,
                  display: "block",
                  color: l.out ? "transparent" : "#fff",
                  WebkitTextStroke: l.out ? "1.5px rgba(255,0,53,0.9)" : "none",
                  clipPath: "inset(0% 0 0 0)",
                }}
              >
                {l.t}
              </h2>
            </div>
          ))}
        </div>

        {/* Contact cards */}
        <div
          className="ct-cards"
          style={{ display: "flex", gap: 0, flexWrap: "wrap", marginBottom: 44 }}
        >
          {CARDS.map(c => (
            <a
              key={c.label}
              href={c.href}
              className="ct-card"
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{
                flex: "1 1 260px",
                display: "flex", alignItems: "center", gap: 16,
                padding: "20px 24px",
                background: "var(--gray)",
                borderLeft: `3px solid ${c.color}`,
                textDecoration: "none",
                transition: "transform 0.25s, background 0.25s",
                margin: "1px",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateX(6px)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,0,53,0.06)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                (e.currentTarget as HTMLElement).style.background = "var(--gray)";
              }}
            >
              <div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 9,
                  letterSpacing: "0.25em", color: c.color, marginBottom: 4,
                }}>
                  {c.label}
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: "#fff",
                  wordBreak: "break-all",
                  fontFamily: "var(--font-mono)",
                }}>
                  {c.value}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="ct-cta">
          <a
            href="mailto:bahromreyimberganov0311@gmail.com"
            className="p5-btn p5-btn-red"
            style={{ boxShadow: "0 0 40px rgba(255,0,53,0.45)" }}
          >
            <span className="p5-btn-inner" style={{ fontSize: 13, padding: "15px 44px" }}>
              ◆ XABAR YUBORISH →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
