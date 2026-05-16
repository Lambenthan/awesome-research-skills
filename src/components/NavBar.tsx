import Link from "next/link";
import { SECTION_META } from "@/lib/sections";

const REPO_URL = "https://github.com/Lambenthan/awesome-research-skills";

export function NavBar() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <Link
          href="/"
          className="font-serif text-[18px] italic leading-none text-ink transition hover:text-ember"
        >
          Awesome Research Skills
        </Link>
        <nav className="hidden items-baseline gap-7 sm:flex">
          {(["skills", "ai", "research", "reading"] as const).map((id) => (
            <Link
              key={id}
              href={SECTION_META[id].href}
              className="eyebrow transition hover:text-ink"
            >
              {SECTION_META[id].eyebrow}
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
    </header>
  );
}
