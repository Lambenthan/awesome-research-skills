/**
 * Stable URL-safe slug helpers. Outputs are kept short (≤80 chars) so they
 * stay readable in the address bar.
 */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** owner/name → owner-name (URL-safe, retains both parts). */
export function repoSlug(fullName: string): string {
  return fullName.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}
