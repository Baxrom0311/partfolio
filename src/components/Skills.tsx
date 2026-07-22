"use client";
import { useEffect, useRef } from "react";

const BARS = [
  { label: "PYTHON / FASTAPI",   pct: 92, color: "var(--red)"  },
  { label: "C++ / ESP32",        pct: 88, color: "var(--red)"  },
  { label: "TYPESCRIPT / REACT", pct: 85, color: "var(--red)"  },
  { label: "AI / LANGCHAIN",     pct: 78, color: "var(--gold)" },
  { label: "KOTLIN / ANDROID",   pct: 72, color: "var(--gold)" },
  { label: "POSTGRESQL / REDIS", pct: 80, color: "var(--cyan)" },
  { label: "DOCKER / LINUX",     pct: 75, color: "var(--cyan)" },
  { label: "COMPUTER VISION",    pct: 70, color: "var(--gold)" },
];

const TAGS = [
  "Python","TypeScript","JavaScript","C++","C","Kotlin","Dart","Java",
  "FastAPI","Django","Node.js","Express","WebSocket",
  "React","Next.js","Tailwind CSS","Electron",
  "Android","Jetpack Compose","Flutter",
  "ESP32","Raspberry Pi","Arduino","PlatformIO","MQTT","I2C","SPI",
  "LangChain","OpenAI","HuggingFace","TensorFlow","PyTorch","Ollama",
  "PostgreSQL","MongoDB","Redis","MySQL",
  "Docker","Git","Linux","Firebase","Nginx","CI/CD",
];

export default function Skills() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.from(".sk-mark", { opacity: 0, x: -40, duration: 0.7, scrollTrigger: { trigger: ".sk-mark", start: "top 87%" } });
        gsap.from(".sk-head", { clipPath: "inset(100% 0 0 0)", duration: 0.9, ease: "power4.out", scrollTrigger: { trigger: ".sk-head", start: "top 85%" } });
        gsap.from(".sk-tag", { opacity: 0, y: 14, duration: 0.4, stagger: 0.015, ease: "power2.out", scrollTrigger: { trigger: ".sk-tags", start: "top 88%" } });

        const bars = (ref.current ?? document).querySelectorAll<HTMLElement>(".hp-fill");
        bars.forEach(bar => {
          const w = bar.dataset.width ?? "0";
          gsap.fromTo(bar, { width: "0%" }, {
            width: w + "%", duration: 1.4, ease: "power3.out",
            scrollTrigger: { trigger: bar, start: "top 92%" },
          });
        });
      }, ref);
      return () => ctx.revert();
    };
    const c = init();
    return () => { c.then(fn => fn?.()); };
  }, []);

  const left  = BARS.slice(0, 4);
  const right = BARS.slice(4);

  return (
    <section
      ref={ref}
      id="skills"
      style={{
        padding: "120px 40px",
        background: "var(--gray)",
        borderTop: "2px solid var(--red)",
        position: "relative", zIndex: 1,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="sk-mark ch-marker">
          <span className="ch-num">◆ 003</span>
          <span className="ch-sep" />
          <span className="ch-name">TECH ARSENAL</span>
        </div>

        <div className="lw sk-head" style={{ marginBottom: 56, clipPath: "inset(0% 0 0 0)" }}>
          <h2 style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(52px, 9vw, 100px)",
            letterSpacing: "0.03em", lineHeight: 1, color: "#fff",
          }}>
            TECH{" "}
            <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(0,212,255,0.7)" }}>
              ARSENAL
            </span>
          </h2>
        </div>

        {/* HP Bars grid */}
        <div
          className="p5-grid-2"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 64 }}
        >
          {[left, right].map((col, ci) => (
            <div key={ci}>
              {col.map(b => (
                <div key={b.label} style={{ marginBottom: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 10,
                      letterSpacing: "0.14em", color: "#fff",
                    }}>
                      {b.label}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 11,
                      fontWeight: 700, color: b.color,
                    }}>
                      {b.pct}%
                    </span>
                  </div>
                  <div className="hp-track">
                    <div
                      className="hp-fill"
                      data-width={String(b.pct)}
                      style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,0,53,0.25)" }} />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.25em", color: "var(--muted)",
          }}>
            ALL TECHNOLOGIES
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,0,53,0.25)" }} />
        </div>

        {/* Tags cloud */}
        <div className="sk-tags" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TAGS.map(tag => (
            <span
              key={tag}
              className="sk-tag"
              style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.12em", padding: "5px 12px",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--muted)",
                transition: "border-color 0.2s, color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--red)";
                el.style.color = "#fff";
                el.style.background = "rgba(255,0,53,0.06)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(255,255,255,0.1)";
                el.style.color = "var(--muted)";
                el.style.background = "transparent";
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
