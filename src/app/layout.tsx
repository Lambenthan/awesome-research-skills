import type { Metadata } from "next";
import { Geist, Source_Serif_4, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

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
  title: "Field Notes · 田野笔记",
  description:
    "研究路上的随手笔记。收录用得上的 Claude Code skill、AI 与科研方向的开源项目、值得读的研究长文。",
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
        {/*
          LXGW WenKai Screen — screen-optimized variant of 霞鹜文楷.
          Strokes adjusted for crispness at 10–16px, so we get the kaiti
          aesthetic without the small-size fuzziness of the regular WenKai.
          Subsetted by unicode-range, so only the glyphs used on the page
          get downloaded. If a visitor has any LXGW WenKai variant installed
          locally the local copy wins (no fetch).
        */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont/lxgwwenkaiscreen.css"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
