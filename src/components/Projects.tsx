"use client";
import { useEffect, useRef } from "react";

const PROJECTS = [
  {
    num: "001", badge: "IoT",
    title: "SMART GREENHOUSE",
    sub: "ghouse_iot · backend · frontend",
    desc: "ESP32 asosida to'liq avtomatlashtirilgan issiqxona tizimi. Real-time sensor monitoring, WebSocket grafik, FastAPI backend.",
    tags: ["ESP32", "C++", "FastAPI", "WebSocket", "TypeScript"],
    href: "https://github.com/Baxrom0311",
    accent: "var(--red)",
  },
  {
    num: "002", badge: "AI",
    title: "CAREROUTE AI",
    sub: "CareRoute-AI — Tibbiy AI navigator",
    desc: "O'zbekiston uchun birinchi tibbiy AI triage tizimi. LangChain + OpenAI asosida urgency classification va doctor matching.",
    tags: ["Python", "LangChain", "OpenAI", "FastAPI"],
    href: "https://github.com/Baxrom0311/CareRoute-AI",
    accent: "var(--gold)",
  },
  {
    num: "003", badge: "Multi-platform",
    title: "UNI-NAV",
    sub: "@uni-nav — TUIT kampus navigatsiyasi",
    desc: "Multi-platform ichki navigatsiya: Android app (Kotlin), Desktop Kiosk (TypeScript), Web navigator va Python backend.",
    tags: ["TypeScript", "Python", "Kotlin", "Android"],
    href: "https://github.com/uni-nav",
    accent: "var(--cyan)",
  },
  {
    num: "004", badge: "IoT+Mobile",
    title: "SMARTPARK",
    sub: "smartpark-esp32 · backend · android",
    desc: "Aqilli parkovka tizimi. ESP32 ultrasonic sensorlar, FastAPI backend (JWT, PostgreSQL, SSE), Kotlin Jetpack Compose app.",
    tags: ["ESP32", "C++", "FastAPI", "Kotlin", "PostgreSQL"],
    href: "https://github.com/Baxrom0311",
    accent: "var(--red)",
  },
  {
    num: "005", badge: "Industry",
    title: "TE71 MONITOR",
    sub: "te71-meter-monitor",
    desc: "Toshelectroapparat TE71/TE73 elektr hisoblagich monitoring platformasi. ESP32 + FastAPI + WebSocket + Desktop app.",
    tags: ["ESP32", "FastAPI", "WebSocket", "Python"],
    href: "https://github.com/Baxrom0311/te71-meter-monitor",
    accent: "var(--gold)",
  },
];

export default function Projects() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.from(".pr-mark", { opacity: 0, x: -40, duration: 0.7, scrollTrigger: { trigger: ".pr-mark", start: "top 87%" } });
        gsap.from(".pr-head", { clipPath: "inset(100% 0 0 0)", duration: 0.9, ease: "power4.out", scrollTrigger: { trigger: ".pr-head", start: "top 85%" } });
        const cards = (ref.current ?? document).querySelectorAll(".pr-card");
        cards.forEach((card, i) => {
          gsap.from(card, {
            opacity: 0,
            x: i % 2 === 0 ? -60 : 60,
            duration: 0.75, ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          });
        });
      }, ref);
      return () => ctx.revert();
    };
    const c = init();
    return () => { c.then(fn => fn?.()); };
  }, []);

  return (
    <section
      ref={ref}
      id="projects"
      style={{ padding: "120px 40px", background: "#000", position: "relative", zIndex: 1 }}
    >
      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.3,
        backgroundImage: `linear-gradient(rgba(255,0,53,0.07) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,0,53,0.07) 1px, transparent 1px)`,
        backgroundSize: "55px 55px", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <div className="pr-mark ch-marker">
          <span className="ch-num">◆ 002</span>
          <span className="ch-sep" />
          <span className="ch-name">MISSION SELECT</span>
        </div>

        <div className="lw pr-head" style={{ marginBottom: 56, clipPath: "inset(0% 0 0 0)" }}>
          <h2 style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(52px, 9vw, 100px)",
            letterSpacing: "0.03em", lineHeight: 1, color: "#fff",
          }}>
            FEATURED{" "}
            <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,0,53,0.8)" }}>
              PROJECTS
            </span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
          gap: 2,
        }}>
          {PROJECTS.map(p => (
            <div
              key={p.num}
              className="pr-card"
              style={{
                padding: 28,
                background: "var(--gray)",
                position: "relative",
                borderTop: `3px solid ${p.accent}`,
                transition: "background 0.3s, transform 0.3s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,0,53,0.07)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--gray)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {/* Number + badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: p.accent, letterSpacing: "0.15em" }}>
                  [{p.num}]
                </span>
                <div className="p5-skew" style={{ background: p.accent }}>
                  <span className="p5-skew-inner" style={{
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    fontWeight: 700, letterSpacing: "0.12em",
                    color: p.accent === "var(--gold)" ? "#000" : "#fff",
                    padding: "2px 10px", display: "block",
                  }}>
                    {p.badge}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily: "var(--font-bebas)", fontSize: 26,
                letterSpacing: "0.04em", color: "#fff",
                lineHeight: 1, marginBottom: 6,
              }}>
                {p.title}
              </h3>

              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 9,
                letterSpacing: "0.1em", color: "var(--muted)",
                marginBottom: 14,
              }}>
                {p.sub}
              </p>

              <p style={{ fontSize: 13, lineHeight: 1.75, color: "#888", marginBottom: 18 }}>
                {p.desc}
              </p>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20 }}>
                {p.tags.map(t => (
                  <span key={t} style={{
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    letterSpacing: "0.12em", padding: "3px 9px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "var(--muted)",
                  }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Link */}
              <a
                href={p.href} target="_blank" rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  fontWeight: 700, letterSpacing: "0.2em",
                  color: p.accent, textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.6")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                ◆ GITHUB ↗
              </a>
            </div>
          ))}
        </div>

        {/* More CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a
            href="https://github.com/Baxrom0311"
            target="_blank" rel="noopener noreferrer"
            className="p5-btn p5-btn-outline"
          >
            <span className="p5-btn-inner">◆ GITHUB&apos;DA BARCHASI ↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
