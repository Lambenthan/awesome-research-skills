import Link from "next/link";
import { SECTION_META } from "@/lib/sections";

const REPO_URL = "https://github.com/Lambenthan/field-notes";

// /learn/ lives under /public/learn/ as a pre-built static site (learn-claude-code).
// Next's <Link> would try client-routing into it and miss; <a> with the basePath
// prefixed manually navigates the browser straight to the static index.html.
const LEARN_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/learn/";

const NAV_LINKS = [
  { href: SECTION_META.skills.href, label: SECTION_META.skills.eyebrow },
  { href: SECTION_META.ai.href, label: SECTION_META.ai.eyebrow },
  { href: SECTION_META.reading.href, label: SECTION_META.reading.eyebrow },
  { href: SECTION_META.notes.href, label: SECTION_META.notes.eyebrow },
  { href: "/latest", label: "Latest · Live", accent: true as const },
];

export function NavBar() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-6 px-6 py-5">
        <Link
          href="/"
          className="font-serif text-[18px] italic leading-none text-ink transition hover:text-ember"
        >
          Field Notes
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
          <a
            href={LEARN_PATH}
            className="eyebrow transition hover:text-ink"
          >
            Learn
          </a>
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
            GitHub <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      {/* Mobile fallback row — keeps every section reachable on <sm screens. */}
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
        <a href={LEARN_PATH} className="eyebrow transition hover:text-ink">
          Learn
        </a>
        <Link href="/search" className="eyebrow transition hover:text-ink">
          Search
        </Link>
      </nav>
    </header>
  );
}
