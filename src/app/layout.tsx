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
      {/*
        CJK text now uses system heiti (PingFang SC / Source Han Sans /
        Noto Sans CJK SC), which all major OS ship with — no webfont needed.
        Earlier we loaded LXGW WenKai from jsdelivr but it softened UI
        elements too much for a listing site. The font stack still lists
        --font-cn-serif so individual long-form essays can opt back in.
      */}
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
