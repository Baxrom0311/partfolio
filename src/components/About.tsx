"use client";
import { useEffect, useRef } from "react";
import HologramGlobe from "./HologramGlobe";
import HologramCar   from "./HologramCar";
import HologramPlane from "./HologramPlane";

const INFO = [
  { k: "NAME",     v: "BAKHROM REYIMBERGANOV" },
  { k: "ROLE",     v: "FULL-STACK · IoT · AI DEV" },
  { k: "LOCATION", v: "UZBEKISTAN 🇺🇿" },
  { k: "ORG",      v: "@UNI-NAV" },
  { k: "MOTTO",    v: '"SHIP REAL THINGS"' },
];

const DOMAINS = [
  { label: "BACKEND",  techs: ["Python", "FastAPI", "Django", "Node.js", "WebSocket"] },
  { label: "EMBEDDED", techs: ["C++", "ESP32", "Arduino", "Raspberry Pi", "MQTT"] },
  { label: "FRONTEND", techs: ["TypeScript", "React", "Next.js", "Tailwind", "Electron"] },
  { label: "AI / ML",  techs: ["LangChain", "OpenAI", "HuggingFace", "TensorFlow", "Ollama"] },
  { label: "MOBILE",   techs: ["Kotlin", "Jetpack Compose", "Flutter", "Android"] },
  { label: "DATABASE", techs: ["PostgreSQL", "Redis", "MongoDB", "MySQL"] },
  { label: "DEVOPS",   techs: ["Docker", "Linux", "Nginx", "Git", "CI/CD"] },
];

const TAGS = [
  "Python","TypeScript","JavaScript","C++","C","Kotlin","Dart",
  "FastAPI","Django","Node.js","Express","WebSocket",
  "React","Next.js","Tailwind CSS","Electron",
  "Android","Jetpack Compose","Flutter",
  "ESP32","Raspberry Pi","Arduino","PlatformIO","MQTT","I2C","SPI",
  "LangChain","OpenAI","HuggingFace","TensorFlow","PyTorch","Ollama",
  "PostgreSQL","MongoDB","Redis","MySQL",
  "Docker","Git","Linux","Firebase","Nginx","CI/CD",
];

// Identical ABOUT heading used inside every region
function AboutText() {
  return (
    <div style={{
      position: "absolute",
      top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none", userSelect: "none",
    }}>
      <h2 style={{
        fontFamily: "var(--font-bebas)",
        fontSize: "clamp(100px, 19vw, 230px)",
        letterSpacing: "0.1em", lineHeight: 1,
        color: "transparent",
        WebkitTextStroke: "2px rgba(255,0,53,0.65)",
        whiteSpace: "nowrap",
      }}>ABOUT</h2>
    </div>
  );
}

export default function About() {
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const pin = pinRef.current;
      if (!pin) return;

      const regionA = pin.querySelector<HTMLElement>(".ab-region-a");
      const regionB = pin.querySelector<HTMLElement>(".ab-region-b");
      const regionC = pin.querySelector<HTMLElement>(".ab-region-c");
      const slash1  = pin.querySelector<HTMLElement>(".ab-slash-1");
      const slash2  = pin.querySelector<HTMLElement>(".ab-slash-2");
      const flash   = pin.querySelector<HTMLElement>(".ab-flash");
      const content = pin.querySelector<HTMLElement>(".ab-content");

      if (!regionA || !regionB || !regionC || !slash1 || !slash2 || !flash || !content) return;

      const regions = [regionA, regionB, regionC];

      // Paused timeline — ScrollTrigger plays / resets it
      const tl = gsap.timeline({ paused: true });

      tl
        /* ── SLASH 1: katana tez o'tadi ── */
        .fromTo(slash1,
          { scaleX: 0, opacity: 1 },
          { scaleX: 1, duration: 0.13, ease: "power4.in" },
        )
        /* Impact flash — oq chaqnash (anime impact frame) */
        .set(flash, { backgroundColor: "#fff" })
        .fromTo(flash, { opacity: 0.85 }, { opacity: 0, duration: 0.14, ease: "power2.out", immediateRender: false })
        /* Screen shake — zarba tebranishi */
        .to(regions, {
          keyframes: [
            { x: -7, y: 3, duration: 0.04 },
            { x: 5,  y: -2, duration: 0.04 },
            { x: -2, y: 1, duration: 0.04 },
            { x: 0,  y: 0, duration: 0.04 },
          ],
        }, "<")
        /* Kesik ochiladi: A tepaga, B pastga siljiydi — kesilganini his qildiradi */
        .to(regionA, { y: -9, rotation: -0.35, duration: 0.16, ease: "power2.out" }, "<0.05")
        .to(regionB, { y: 6, x: 16, skewX: 1.2, duration: 0.16, ease: "power2.out" }, "<")
        /* Slash izi qolib turadi (qizil cho'g') */
        .to(slash1, { opacity: 0.35, duration: 0.08 }, "<")

        /* ── SLASH 2: ikkinchi zarba kuchliroq ── */
        .fromTo(slash2,
          { scaleX: 0, opacity: 1 },
          { scaleX: 1, duration: 0.13, ease: "power4.in" },
          "+=0.18",
        )
        .set(flash, { backgroundColor: "#fff" })
        .fromTo(flash, { opacity: 0.9 }, { opacity: 0, duration: 0.14, ease: "power2.out", immediateRender: false })
        .to(regions, {
          keyframes: [
            { x: 8,  y: -3, duration: 0.04 },
            { x: -6, y: 3, duration: 0.04 },
            { x: 3,  y: -1, duration: 0.04 },
            { x: 0,  y: 0, duration: 0.045 },
          ],
        }, "<")
        /* Ikkinchi kesik ochiladi */
        .to(regionB, { x: 24, y: 8, skewX: 2, duration: 0.14, ease: "power2.out" }, "<0.05")
        .to(regionC, { y: 10, rotation: 0.35, duration: 0.14, ease: "power2.out" }, "<")
        .to(slash2, { opacity: 0.35, duration: 0.08 }, "<")

        /* ── SHATTER: qizil chaqnash + 3 qism aylanip uchib ketadi ── */
        .set(flash, { backgroundColor: "#FF0035" }, "+=0.12")
        .fromTo(flash, { opacity: 0.35 }, { opacity: 0, duration: 0.2, ease: "power2.out", immediateRender: false })
        .to([slash1, slash2], { opacity: 0, duration: 0.1 }, "<")
        .to(regionA,
          { y: "-125vh", x: -70, rotation: -6, duration: 0.5, ease: "power3.in" },
          "<",
        )
        .to(regionB,
          { x: "125vw", rotation: 2.5, skewX: 6, duration: 0.45, ease: "power2.in" },
          "<0.04",
        )
        .to(regionC,
          { y: "125vh", x: 70, rotation: 6, duration: 0.5, ease: "power3.in" },
          "<0.02",
        )

        /* ── CONTENT chiqadi ── */
        .fromTo(content,
          { opacity: 0, y: 26, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" },
          "-=0.2",
        )
        .from(".ab-info-row", { x: -24, opacity: 0, stagger: 0.07, duration: 0.4, ease: "power2.out" }, "-=0.25");

      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: isMobile ? "+=120%" : "+=180%",  // mobilda qisqaroq hold
        pin: true,
        anticipatePin: 1,
        animation: tl,
        // play: kirganida → reset: chiqib ketganida (orqaga) — INSTANT
        toggleActions: "play none none reset",
      });

      // Tags (outside pinned area, normal scroll)
      gsap.from(".ab-tag", {
        opacity: 0, y: 10, duration: 0.3, stagger: 0.012,
        scrollTrigger: { trigger: ".ab-tags", start: "top 85%", once: true },
      });

      // Tag glitch cycle — random tags flare up periodically (reduced-motion'da o'chiq)
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tags = Array.from(document.querySelectorAll<HTMLElement>(".ab-tag"));
      let glitchInt = 0;
      if (!reducedMotion) {
        glitchInt = window.setInterval(() => {
          for (let k = 0; k < 2; k++) {
            const el = tags[Math.floor(Math.random() * tags.length)];
            if (!el) continue;
            el.classList.add("tag-hot");
            window.setTimeout(() => el.classList.remove("tag-hot"), 500);
          }
        }, 1400);
      }

      return () => {
        window.clearInterval(glitchInt);
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    };

    const c = init();
    return () => { c.then(fn => fn?.()); };
  }, []);

  /* ─── Clip-path geometry ────────────────────────────────────────────────
     Two diagonal cuts at ~5° angle:
       Cut 1 goes from y=38% (left) → y=48% (right)
       Cut 2 goes from y=52% (left) → y=62% (right)

     Region A (top):    above cut 1
     Region B (middle): between cut 1 and cut 2
     Region C (bottom): below cut 2
  ─────────────────────────────────────────────────────────────────────── */
  const REGION_A_CLIP = "polygon(0 0, 100% 0, 100% 48%, 0 38%)";
  const REGION_B_CLIP = "polygon(0 38%, 100% 48%, 100% 62%, 0 52%)";
  const REGION_C_CLIP = "polygon(0 52%, 100% 62%, 100% 100%, 0 100%)";

  const SLASH_STYLE: React.CSSProperties = {
    position: "absolute", left: "-5%", right: "-5%",
    height: 3, zIndex: 12,
    background: "linear-gradient(to right, transparent 0%, #FF0035 20%, #fff 50%, #FF0035 80%, transparent 100%)",
    boxShadow: "0 0 20px #FF0035, 0 0 50px rgba(255,0,53,0.5)",
    transformOrigin: "left center",
    transform: "rotate(5deg)",
  };

  return (
    <section id="about" style={{ position: "relative", zIndex: 1 }}>

      {/* ═══════════════════════════════════════════════
          PINNED PANEL
          ═══════════════════════════════════════════════ */}
      <div
        ref={pinRef}
        style={{
          height: "100vh", overflow: "hidden",
          background: "#000",
          borderTop: "2px solid var(--red)",
          position: "relative",
        }}
      >

        {/* ── LAYER 1: content (revealed after shatter) ── */}
        <div
          className="ab-content"
          style={{
            position: "absolute", inset: 0, zIndex: 1,
            display: "flex", alignItems: "center",
            padding: "0 40px", opacity: 0,
          }}
        >
          <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
            <div className="ch-marker" style={{ marginBottom: 36 }}>
              <span className="ch-num">◆ 001</span>
              <span className="ch-sep" />
              <span className="ch-name">CHARACTER INFO</span>
            </div>

            <div className="about-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
              <div>
                {[
                  { t: "O'ZBEKISTON", out: false },
                  { t: "DEVELOPER",   out: true  },
                  { t: "& ENGINEER",  out: false },
                ].map((l, i) => (
                  <div className="lw" key={i}>
                    <span style={{
                      display: "block",
                      fontFamily: "var(--font-bebas)",
                      fontSize: "clamp(38px, 5.5vw, 66px)",
                      letterSpacing: "0.02em", lineHeight: 1.05,
                      color: l.out ? "transparent" : "#fff",
                      WebkitTextStroke: l.out ? "1.5px rgba(255,0,53,0.85)" : "none",
                    }}>{l.t}</span>
                  </div>
                ))}

                <div style={{ marginTop: 28 }}>
                  {INFO.map(row => (
                    <div key={row.k} className="ab-info-row" style={{
                      display: "flex", gap: 16, alignItems: "baseline",
                      padding: "9px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 9,
                        letterSpacing: "0.22em", color: "var(--red)",
                        minWidth: 80, flexShrink: 0,
                      }}>{row.k}</span>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 11,
                        letterSpacing: "0.1em", color: "#fff", fontWeight: 600,
                      }}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Globe hologram */}
              <div className="holo-col" style={{ display: "flex", justifyContent: "flex-end" }}>
                <HologramGlobe width={420} height={420} />
              </div>
            </div>
          </div>
        </div>

        {/* ── LAYER 2: REGION A — top piece ── */}
        <div
          className="ab-region-a"
          style={{
            position: "absolute", inset: 0, zIndex: 10,
            background: "#000",
            clipPath: REGION_A_CLIP,
          }}
        >
          <AboutText />
        </div>

        {/* ── LAYER 3: REGION B — middle piece (gets damaged after slash 1) ── */}
        <div
          className="ab-region-b"
          style={{
            position: "absolute", inset: 0, zIndex: 10,
            background: "#000",
            clipPath: REGION_B_CLIP,
          }}
        >
          <AboutText />
          {/* Red damage tint on the middle strip */}
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(255,0,53,0.07)",
            clipPath: REGION_B_CLIP,
            pointerEvents: "none",
          }} />
        </div>

        {/* ── LAYER 4: REGION C — bottom piece ── */}
        <div
          className="ab-region-c"
          style={{
            position: "absolute", inset: 0, zIndex: 10,
            background: "#000",
            clipPath: REGION_C_CLIP,
          }}
        >
          <AboutText />
        </div>

        {/* ── LAYER 5: Slash line 1 (top cut) ── */}
        <div
          className="ab-slash-1"
          style={{ ...SLASH_STYLE, top: "calc(43% - 1.5px)" }}
        />

        {/* ── LAYER 6: Slash line 2 (bottom cut) ── */}
        <div
          className="ab-slash-2"
          style={{ ...SLASH_STYLE, top: "calc(57% - 1.5px)" }}
        />

        {/* ── LAYER 7: Impact flash (anime zarba kadri) ── */}
        <div
          className="ab-flash"
          style={{
            position: "absolute", inset: 0, zIndex: 14,
            background: "#fff", opacity: 0,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════
          HARD SKILLS
          ═══════════════════════════════════════════════ */}
      <div className="about-pad" style={{
        background: "var(--gray)",
        borderTop: "2px solid rgba(255,0,53,0.3)",
        padding: "100px 40px",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="ch-marker" style={{ marginBottom: 44 }}>
            <span className="ch-num">◆ 001</span>
            <span className="ch-sep" />
            <span className="ch-name">HARD SKILLS</span>
          </div>

          <div className="about-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div>
              {DOMAINS.map((d, i) => (
                <div key={d.label} style={{
                  display: "flex", gap: 16, alignItems: "flex-start",
                  padding: "13px 0",
                  borderBottom: i < DOMAINS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    letterSpacing: "0.2em", color: "var(--red)",
                    minWidth: 78, flexShrink: 0, paddingTop: 2,
                  }}>{d.label}</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {d.techs.map((tech, ti) => (
                      <span key={tech} style={{
                        fontFamily: "var(--font-mono)", fontSize: 10,
                        letterSpacing: "0.1em", color: "#ccc",
                      }}>
                        {tech}{ti < d.techs.length - 1 && (
                          <span style={{ color: "rgba(255,0,53,0.5)", margin: "0 3px" }}>·</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* BMW M5 hologram */}
            <div className="holo-col" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <HologramCar width={580} height={340} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          TECH STACK
          ═══════════════════════════════════════════════ */}
      <div className="about-pad" style={{
        background: "#000",
        borderTop: "2px solid rgba(255,0,53,0.2)",
        padding: "80px 40px",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="ch-marker" style={{ marginBottom: 36 }}>
            <span className="ch-num">◆ 001</span>
            <span className="ch-sep" />
            <span className="ch-name">TECH STACK</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,0,53,0.2)" }} />
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9,
              letterSpacing: "0.25em", color: "var(--muted)",
            }}>ALL TECHNOLOGIES</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,0,53,0.2)" }} />
          </div>

          <div className="about-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div className="ab-tags" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TAGS.map(tag => (
                <span
                  key={tag}
                  className="ab-tag"
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

            {/* Airplane hologram — yarim sahifa */}
            <div className="holo-col" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <HologramPlane width={500} height={580} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
