import Link from "next/link";
import { SECTION_META } from "@/lib/sections";

const REPO_URL = "https://github.com/Lambenthan/field-notes";

const NAV_LINKS = [
  { href: SECTION_META.skills.href, label: SECTION_META.skills.eyebrow },
  { href: SECTION_META.ai.href, label: SECTION_META.ai.eyebrow },
  { href: SECTION_META.research.href, label: SECTION_META.research.eyebrow },
  { href: SECTION_META.reading.href, label: SECTION_META.reading.eyebrow },
  { href: "/latest", label: "Latest · Live", accent: true as const },
];

export function NavBar() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
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
        </nav>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow transition hover:text-ink"
        >
          GitHub →
        </a>
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
      </nav>
    </header>
  );
}
