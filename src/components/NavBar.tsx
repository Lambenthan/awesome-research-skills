import Link from "next/link";
import { SECTION_META } from "@/lib/sections";

const REPO_URL = "https://github.com/Lambenthan/field-notes";

const NAV_LINKS = [
  { href: SECTION_META.skills.href, label: SECTION_META.skills.eyebrow },
  { href: SECTION_META.ai.href, label: SECTION_META.ai.eyebrow },
  { href: SECTION_META.reading.href, label: SECTION_META.reading.eyebrow },
  { href: SECTION_META.notes.href, label: SECTION_META.notes.eyebrow },
  { href: "/latest", label: "Latest", accent: true as const },
];

/**
 * Top nav — maggieappleton.com pattern.
 *
 * Left: a small monogram-style logotype. Maggie uses a hand-drawn "M"
 * where the left wing is maroon and the right wing is teal; we mirror
 * the two-tone but spell out the brand instead of drawing an icon so
 * the wordmark stays legible without an asset.
 *
 * Right: small uppercase Lato nav links with very wide tracking. No
 * pill or background — just text, with subtle ember on hover.
 */
export function NavBar() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-[68rem] items-center justify-between gap-6 px-6 py-5">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5"
          aria-label="Field Notes — home"
        >
          {/* Two-tone monogram disc, the maroon F and teal N joined in
              one round mark. Mirrors Maggie's wing-tinted M icon. */}
          <span
            aria-hidden="true"
            className="relative inline-flex h-7 w-7 items-center justify-center"
          >
            <span className="absolute inset-0 rounded-full bg-cream-elevated border border-rule-strong" />
            <span className="relative font-serif text-[15px] leading-none">
              <span className="text-ember">F</span>
              <span className="text-teal">N</span>
            </span>
          </span>
          <span className="font-serif text-[18px] italic leading-none text-ink transition group-hover:text-ember">
            Field Notes
          </span>
        </Link>
        <nav className="hidden items-baseline gap-7 sm:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`eyebrow transition hover:text-ink ${
                l.accent ? "text-ember" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <Link
            href="/search"
            className="eyebrow transition hover:text-ink"
            aria-label="站内搜索"
          >
            Search
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow transition hover:text-ink"
          >
            GitHub
          </a>
        </div>
      </div>
      {/* Mobile fallback row */}
      <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule px-6 py-3 sm:hidden">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`eyebrow transition hover:text-ink ${
              l.accent ? "text-ember" : ""
            }`}
          >
            {l.label}
          </Link>
        ))}
        <Link href="/search" className="eyebrow transition hover:text-ink">
          Search
        </Link>
      </nav>
    </header>
  );
}
