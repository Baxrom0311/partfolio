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
            rotation: i % 2 === 0 ? -2.5 : 2.5,
            duration: 0.75, ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          });
        });

        // Touch qurilmalarda hover yo'q — karta markazga kelganda "yonadi"
        if (window.matchMedia("(hover: none)").matches) {
          cards.forEach(card => {
            ScrollTrigger.create({
              trigger: card,
              start: "top 62%",
              end: "bottom 38%",
              onToggle: self => card.classList.toggle("pf-active", self.isActive),
            });
          });
        }
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
      className="proj-pad"
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

        <div className="proj-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
          gap: 18,
        }}>
          {PROJECTS.map(p => (
            <a
              key={p.num}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pr-card pf-card"
              style={{ "--acc": p.accent } as React.CSSProperties}
              onMouseMove={e => {
                const el = e.currentTarget;
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width  - 0.5;
                const py = (e.clientY - r.top)  / r.height - 0.5;
                el.style.setProperty("--ry", `${(px * 14).toFixed(2)}deg`);
                el.style.setProperty("--rx", `${(-py * 10).toFixed(2)}deg`);
                el.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
                el.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
                el.style.setProperty("--px", px.toFixed(3));
                el.style.setProperty("--py", py.toFixed(3));
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.setProperty("--ry", "0deg");
                el.style.setProperty("--rx", "0deg");
                el.style.setProperty("--px", "0");
                el.style.setProperty("--py", "0");
              }}
            >
              <div className="pf-inner">
                <div className="pf-bg" />
                <div className="pf-burst" />
                <div className="pf-shine" />
                <div className="pf-scan" />
                <span className="pf-ghost">{p.num}</span>

                <span className="pf-c pf-c-tl" /><span className="pf-c pf-c-tr" />
                <span className="pf-c pf-c-bl" /><span className="pf-c pf-c-br" />

                <div className="pf-head">
                  <span className="pf-file">FILE No.{p.num}</span>
                  <span className="pf-badge">
                    <span style={{ color: p.accent === "var(--gold)" ? "#000" : "#fff" }}>
                      {p.badge}
                    </span>
                  </span>
                  <span className="pf-barcode" />
                </div>

                <h3 className="pf-title">{p.title}</h3>
                <p className="pf-sub">{p.sub}</p>
                <p className="pf-desc">{p.desc}</p>

                <div className="pf-tags">
                  {p.tags.map(t => (
                    <span key={t} className="pf-tag">{t}</span>
                  ))}
                </div>

                <div className="pf-foot">
                  <span className="pf-status"><i />ACTIVE</span>
                  <span className="pf-link">OPEN FILE <b>↗</b></span>
                </div>
              </div>
            </a>
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
