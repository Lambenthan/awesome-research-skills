import type { NextConfig } from "next";

// Deploying to GitHub Pages as a project page → site lives under
// `/awesome-research-skills/`. The deploy workflow sets NEXT_PUBLIC_BASE_PATH;
// local dev leaves it empty so http://localhost:3000/ works directly.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
