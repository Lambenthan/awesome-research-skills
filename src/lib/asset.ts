const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Prefix a public/ asset path with NEXT_PUBLIC_BASE_PATH at build time.
 *
 * Used for plain <img> / <a> / direct asset references that bypass
 * next/image. next/image's basePath handling is unreliable when combined
 * with `output: "export"` + `images.unoptimized: true`, so for static
 * assets under public/ we prefer plain tags + this helper.
 *
 * Pass-through cases: external URLs, already-prefixed paths, and paths
 * that don't start with "/".
 */
export function asset(src: string): string {
  if (!src.startsWith("/")) return src;
  if (BASE_PATH && src.startsWith(`${BASE_PATH}/`)) return src;
  return `${BASE_PATH}${src}`;
}
