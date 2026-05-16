import type { Metadata } from "next";
import { Geist, Source_Serif_4, Geist_Mono } from "next/font/google";
import "./globals.css";

// Anthropic uses proprietary Styrene B (sans) + Tiempos Text (serif). We
// declare those names first in the font-family stack so users who happen to
// have them installed get the real experience; everyone else falls back to
// the closest free equivalents: Geist (Vercel) and Source Serif 4 (Adobe).
// next/font self-hosts these and exposes them as CSS variables we feed into
// @theme inside globals.css.
//
// Mona Sans (GitHub's Styrene-similar font) was the first pick but isn't yet
// in next/font/google's catalog. Geist is the second-closest free analog and
// fully supported.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Awesome Research Skills — 科研 skill 与开源项目集",
  description:
    "为科研挑选的 Claude Code skill 与开源项目；每条都来自公开仓库，直链 skills.sh 与 GitHub 源。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-Hans"
      className={`${geist.variable} ${sourceSerif.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        {/* LXGW WenKai (霞鹜文楷) — open-source Chinese serif, OFL. Sub-set
            via unicode-range so only the needed glyphs download. If the
            visitor already has LXGW installed locally (macOS/Windows), the
            local copy wins and these files are never fetched. */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont/lxgwwenkai-regular.css"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
