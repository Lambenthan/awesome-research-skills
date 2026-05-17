/**
 * SSR-safe short date formatter for /latest rows.
 *
 * The previous "X days ago" helper used Date.now() at render time, which
 * differs between build-time SSR and client hydration → React hydration
 * mismatch (and the visible label drifts over time without re-deploy).
 *
 * Returning a fixed absolute date string makes server output identical
 * to client output, satisfying the no-hydration-mismatch guideline.
 */
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
