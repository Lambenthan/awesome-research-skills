"use client";

import { useEffect, useState } from "react";

/**
 * Date display that ships SSR as an absolute ISO date and upgrades on
 * the client to a relative "5d ago" form. SSR output and first client
 * render are identical (no hydration mismatch); the relative label
 * appears on the next paint after mount.
 *
 * Use anywhere we previously called formatShortDate(iso) inline:
 *   {item.publishedAt && <TimeDisplay iso={item.publishedAt} />}
 *
 * Only feed item.publishedAt — we don't surface discoveredAt as a
 * display date (per CLAUDE.md, the only user-facing time is the
 * source's own publish time). discoveredAt stays in data as a sort
 * tiebreaker and sitemap lastModified fallback.
 */
export function TimeDisplay({
  iso,
  className,
}: {
  iso: string | null | undefined;
  className?: string;
}) {
  const [relative, setRelative] = useState<string | null>(null);

  useEffect(() => {
    if (!iso) return;
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return;
    setRelative(relativeFromNow(t));
  }, [iso]);

  const absolute = formatShortDate(iso);
  return (
    <time dateTime={iso ?? undefined} className={className} title={absolute}>
      {relative ?? absolute}
    </time>
  );
}

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function relativeFromNow(t: number): string {
  const diff = Date.now() - t;
  if (diff < 0) return formatShortDate(new Date(t).toISOString());
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatShortDate(new Date(t).toISOString());
}
