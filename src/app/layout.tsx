import type { Metadata } from "next";
import { Fraunces, Lato, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

// Typography reference: maggieappleton.com. She uses commercial Canela
// (paid Commercial Type) for serif headers + body, Lato for UI / sans /
// metadata. We substitute Canela with Fraunces — the closest free
// transitional serif on Google Fonts, variable across opsz 9-144 and
// weight 100-900, with similar warmth and high stroke contrast. Lato is
// kept verbatim. Mono uses Geist Mono since Maggie's site barely uses
// monospace and Geist Mono renders crisply across editors and pages.
//
// All three are self-hosted by next/font and exposed as CSS variables
// that @theme picks up inside globals.css.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const SITE_ORIGIN = "https://lambenthan.github.io";
const SITE_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const SITE_URL = SITE_ORIGIN + SITE_BASE_PATH;
const SITE_TITLE = "Field Notes · 田野笔记";
const SITE_DESCRIPTION =
  "Chanw 的研究纲要与应用工具书 36 章，配套 Claude Code skill、AI 与科研方向开源项目、研究长文与每日 AI 动态的发现面板。";
const SITE_OG_IMAGE = SITE_URL + "/og.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL || SITE_ORIGIN),
  title: {
    default: SITE_TITLE,
    template: "%s — Field Notes",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Field Notes",
  authors: [{ name: "Chanw" }],
  keywords: [
    "Field Notes",
    "田野笔记",
    "Claude Code skill",
    "AI 工具",
    "科研工具",
    "因果推断",
    "文本计量",
    "研究笔记",
  ],
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "Field Notes RSS" }],
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL || "/",
    locale: "zh_CN",
    images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-Hans"
      className={`${fraunces.variable} ${lato.variable} ${geistMono.variable} antialiased`}
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
