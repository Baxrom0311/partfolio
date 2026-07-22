export default function Footer() {
  return (
    <footer
      style={{
        background: "#000",
        borderTop: "1px solid rgba(255,0,53,0.2)",
        padding: "22px 40px",
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}
    >
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.2em", color: "var(--muted)",
      }}>
        ◆ © 2026 BAKHROM REYIMBERGANOV
      </span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.15em", color: "rgba(136,136,136,0.5)",
      }}>
        NEXT.JS · GSAP · TAILWIND
      </span>
    </footer>
  );
}
