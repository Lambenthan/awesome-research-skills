import type { MetadataRoute } from "next";

// Required for output: "export" — Next emits robots.txt as a static file
// only when the route is explicitly marked force-static.
export const dynamic = "force-static";

const SITE_ORIGIN = "https://lambenthan.github.io";
const SITE_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const SITE_URL = SITE_ORIGIN + SITE_BASE_PATH;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: SITE_URL + "/sitemap.xml",
    host: SITE_ORIGIN,
  };
}
