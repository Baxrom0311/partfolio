"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap } = await import("gsap");
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(".h-badge",   { opacity: 0, y: -20, duration: 0.6 }, 0.2)
          .from(".h-stripe",  { scaleX: 0, duration: 0.5, transformOrigin: "left" }, 0.35)
          .from(".h-name1",   { clipPath: "inset(100% 0 0 0)", duration: 1 }, 0.4)
          .from(".h-name2",   { clipPath: "inset(100% 0 0 0)", duration: 1 }, 0.52)
          .from(".h-stripe2", { scaleX: 0, duration: 0.5, transformOrigin: "left" }, 0.7)
          .from(".h-ep",      { opacity: 0, duration: 0.6 }, 0.9)
          .from(".h-stat",    { opacity: 0, y: 20, duration: 0.5, stagger: 0.08 }, 1.0)
          .from(".h-cta",     { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 }, 1.15)
          .from(".h-scroll",  { opacity: 0, duration: 0.8 }, 1.6)
          .from(".h-side",    { opacity: 0, duration: 1.2 }, 0.5)
          .from(".h-avatar",  { opacity: 0, x: 60, duration: 1.1, ease: "power3.out" }, 0.3);
      }, ref);
      return () => ctx.revert();
    };
    const c = init();
    return () => { c.then(fn => fn?.()); };
  }, []);

  return (
    <section
      ref={ref}
      id="home"
      className="hero-section"
      style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1,
        padding: "80px 40px",
        overflow: "hidden",
      }}
    >
      {/* Red diagonal glow left */}
      <div style={{
        position: "absolute", left: 0, top: "30%",
        width: 180, height: "40%",
        background: "linear-gradient(90deg, rgba(255,0,53,0.12), transparent)",
        pointerEvents: "none",
      }} />

      {/* Left vertical text */}
      <div className="h-side" style={{
        position: "absolute", left: 20, top: "50%",
        transform: "translateY(-50%) rotate(-90deg)",
        fontFamily: "var(--font-mono)", fontSize: 9,
        letterSpacing: "0.45em", color: "rgba(255,0,53,0.35)",
        whiteSpace: "nowrap", userSelect: "none",
      }}>
        BAKHROM · REYIMBERGANOV · FULL-STACK · IoT · AI
      </div>

      {/* Right vertical text */}
      <div className="h-side" style={{
        position: "absolute", right: 20, top: "50%",
        transform: "translateY(-50%) rotate(90deg)",
        fontFamily: "var(--font-mono)", fontSize: 9,
        letterSpacing: "0.45em", color: "rgba(255,255,255,0.12)",
        whiteSpace: "nowrap", userSelect: "none",
      }}>
        2024 · UZBEKISTAN · @UNI-NAV · OPEN TO WORK
      </div>

      {/* Main 2-column grid */}
      <div className="hero-grid" style={{
        maxWidth: 1100, width: "100%", position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 48,
        alignItems: "center",
      }}>

        {/* LEFT — text content */}
        <div>
          {/* Badge */}
          <div className="h-badge" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            marginBottom: 24,
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.22em", color: "var(--muted)",
          }}>
            <span style={{ color: "var(--red)" }}>◆</span>
            FULL-STACK DEVELOPER · IoT ENGINEER · AI BUILDER
            <span style={{ color: "var(--red)" }}>◆</span>
          </div>

          {/* Red stripe top */}
          <div className="h-stripe" style={{
            height: 2, background: "var(--red)",
            marginBottom: 12,
            boxShadow: "0 0 14px rgba(255,0,53,0.6)",
          }} />

          {/* BAKHROM */}
          <div className="lw h-name1" style={{ clipPath: "inset(0% 0 0 0)" }}>
            <h1
              className="glitch"
              data-text="BAKHROM"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(72px, 12vw, 148px)",
                fontWeight: 400, letterSpacing: "0.06em",
                color: "#fff", lineHeight: 0.9, display: "block",
              }}
            >
              BAKHROM
            </h1>
          </div>

          {/* REYIMBERGANOV */}
          <div className="lw h-name2" style={{ clipPath: "inset(0% 0 0 0)" }}>
            <h1 style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(72px, 12vw, 148px)",
              fontWeight: 400, letterSpacing: "0.06em",
              lineHeight: 0.9, display: "block",
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.6)",
            }}>
              REYIMBERGANOV
            </h1>
          </div>

          {/* Red stripe bottom */}
          <div className="h-stripe2" style={{
            height: 2, background: "var(--red)",
            marginTop: 12, marginBottom: 20,
            boxShadow: "0 0 14px rgba(255,0,53,0.6)",
          }} />

          {/* Episode marker */}
          <div className="h-ep" style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.2em", color: "var(--muted)",
            marginBottom: 32,
          }}>
            ◆ EP.01 &mdash;&mdash; &quot;THE DEVELOPER WHO SHIPS REAL THINGS&quot; &mdash;&mdash; ◆
          </div>

          {/* Stat boxes */}
          <div className="h-stats" style={{ display: "flex", gap: 2, marginBottom: 40, flexWrap: "wrap" }}>
            {[
              { v: "50+", l: "REPOS"    },
              { v: "5+",  l: "STACKS"   },
              { v: "2+",  l: "YIL"      },
              { v: "10+", l: "HACKATON" },
            ].map(s => (
              <div key={s.l} className="h-stat p5-skew" style={{ background: "var(--gray)" }}>
                <div className="p5-skew-inner" style={{
                  padding: "12px 22px", textAlign: "center",
                  borderTop: "2px solid var(--red)",
                }}>
                  <div style={{
                    fontFamily: "var(--font-bebas)", fontSize: 34,
                    color: "var(--red)", lineHeight: 1,
                    textShadow: "0 0 16px rgba(255,0,53,0.5)",
                  }}>
                    {s.v}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    letterSpacing: "0.2em", color: "var(--muted)", marginTop: 2,
                  }}>
                    {s.l}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="h-ctas" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#projects" className="h-cta p5-btn p5-btn-red"
              style={{ boxShadow: "0 0 30px rgba(255,0,53,0.45)" }}>
              <span className="p5-btn-inner">LOYIHALAR →</span>
            </a>
            <a href="https://github.com/Baxrom0311" target="_blank" rel="noopener noreferrer"
              className="h-cta p5-btn p5-btn-white">
              <span className="p5-btn-inner">GITHUB ↗</span>
            </a>
            <a href="mailto:bahromreyimberganov0311@gmail.com"
              className="h-cta p5-btn p5-btn-outline">
              <span className="p5-btn-inner">EMAIL ↗</span>
            </a>
          </div>
        </div>

        {/* RIGHT — avatar */}
        <div className="h-avatar holo-col" style={{
          position: "relative",
          width: "clamp(220px, 28vw, 380px)",
          flexShrink: 0,
          alignSelf: "flex-end",
        }}>
          {/* Red glow behind character */}
          <div style={{
            position: "absolute", bottom: 0, left: "50%",
            transform: "translateX(-50%)",
            width: "90%", height: "50%",
            background: "radial-gradient(ellipse, rgba(255,0,53,0.22), transparent 70%)",
            pointerEvents: "none", zIndex: 0,
          }} />

          {/* Decorative vertical line */}
          <div style={{
            position: "absolute", left: -20, top: "10%",
            width: 1, height: "80%",
            background: "linear-gradient(to bottom, transparent, rgba(255,0,53,0.4), transparent)",
          }} />

          <Image
            src="/avatar.png"
            alt="Bakhrom Reyimberganov"
            width={380}
            height={520}
            priority
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              position: "relative", zIndex: 1,
              maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 72%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 72%, transparent 100%)",
              filter: "drop-shadow(0 0 24px rgba(255,0,53,0.35))",
            }}
          />

          {/* Name tag below image */}
          <div style={{
            position: "absolute", bottom: 28, left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2, whiteSpace: "nowrap",
          }}>
            <div className="p5-skew" style={{ background: "rgba(255,0,53,0.9)" }}>
              <span className="p5-skew-inner" style={{
                fontFamily: "var(--font-mono)", fontSize: 9,
                letterSpacing: "0.2em", color: "#fff",
                padding: "3px 14px", display: "block",
              }}>
                BAKHROM · DEV
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="h-scroll" style={{
        position: "absolute", bottom: 28, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 8,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9,
          letterSpacing: "0.3em", color: "var(--muted)",
        }}>
          SCROLL
        </span>
        <div style={{
          width: 1, height: 40,
          background: "linear-gradient(180deg, var(--red), transparent)",
          animation: "pulse-red 1.8s ease-in-out infinite",
        }} />
      </div>
    </section>
  );
}
