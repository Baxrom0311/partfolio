import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });

export const metadata: Metadata = {
  title: "BAKHROM — Full-Stack · IoT · AI",
  description:
    "Bakhrom Reyimberganov — Full-Stack, IoT & AI developer from Uzbekistan. Building real things that solve real problems.",
  keywords: ["Bakhrom", "Reyimberganov", "portfolio", "IoT", "AI", "Full-Stack", "Uzbekistan"],
  authors: [{ name: "Bakhrom Reyimberganov" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${bebas.variable}`}>
      <body style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-inter)" }}>
        <div className="scanlines" />
        {children}
      </body>
    </html>
  );
}
