import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// Deploying to GitHub Pages as a project page → site lives under
// `/field-notes/`. The deploy workflow sets NEXT_PUBLIC_BASE_PATH; local
// dev leaves it empty so http://localhost:3000/ works directly.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

// Turbopack requires MDX plugin options to be serializable, so reference
// plugins by package name (string) rather than imported function values.
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-math", {}], ["remark-gfm", {}]],
    rehypePlugins: [["rehype-katex", { strict: false }]],
  },
});

export default withMDX(nextConfig);
