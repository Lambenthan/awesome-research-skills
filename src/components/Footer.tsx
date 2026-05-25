import { meta } from "@/lib/data";

const REPO_URL = "https://github.com/Lambenthan/field-notes";
const RSS_URL = "/feed.xml";

/**
 * Footer following maggieappleton.com's two-block pattern.
 *
 * Left block: "Want to stay up to date?" heading, an RSS callout pill,
 * a social icon row, and copyright. Right block: two columns of quiet
 * link lists keyed by intent (Field / Index | Source / Meta).
 *
 * The whole thing sits on a cream-surface band, separated from the
 * page above by a hairline rule.
 */
export function Footer() {
  const buildDate = meta.builtAt
    ? new Date(meta.builtAt).toISOString().slice(0, 10)
    : "—";
  return (
    <footer className="border-t border-rule bg-cream-surface/50">
      <div className="mx-auto max-w-[68rem] px-6 py-16 sm:py-20">
        <div className="grid grid-cols-12 gap-x-8 gap-y-12">
          {/* Left: stay-in-touch + identity. Mirrors Maggie's left block
              with the newsletter heading and RSS pill. Field Notes
              doesn't run a mailing list, so we substitute RSS as the
              follow channel. */}
          <div className="col-span-12 sm:col-span-7">
            <h3 className="font-serif text-[clamp(1.6rem,2.2vw,2rem)] leading-[1.15] tracking-[-0.012em] text-ink">
              Want to stay in the loop?
            </h3>
            <p className="mt-4 max-w-md text-[14.5px] leading-[1.7] text-ink-subtle">
              新文章和数据快照刷新走 RSS。也可以直接看 GitHub commits。
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={RSS_URL}
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-[13px] font-medium text-ink transition hover:border-ember hover:text-ember"
              >
                <span aria-hidden="true">📡</span>
                Subscribe via RSS Feed
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-[13px] font-medium text-ink transition hover:border-ember hover:text-ember"
              >
                <span aria-hidden="true">⌥</span>
                GitHub
              </a>
            </div>
            <p className="mt-10 text-[12.5px] text-meta">
              © {new Date().getFullYear()} Chanw · Field Notes
            </p>
          </div>

          {/* Right: two columns of link lists. Field column = primary
              site surfaces. Index column = meta + provenance. */}
          <div className="col-span-6 sm:col-span-2 sm:col-start-9">
            <p className="eyebrow text-meta">Field</p>
            <ul className="mt-5 space-y-3 font-serif text-[15px] text-ink">
              <li>
                <a href="/skills" className="transition hover:text-ember">
                  Skills
                </a>
              </li>
              <li>
                <a href="/ai" className="transition hover:text-ember">
                  AI
                </a>
              </li>
              <li>
                <a href="/reading" className="transition hover:text-ember">
                  Reading
                </a>
              </li>
              <li>
                <a href="/notes" className="transition hover:text-ember">
                  Notes
                </a>
              </li>
              <li>
                <a href="/latest" className="transition hover:text-ember">
                  Latest
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-6 sm:col-span-3">
            <p className="eyebrow text-meta">Index</p>
            <ul className="mt-5 space-y-3 font-serif text-[15px] text-ink">
              <li>
                <a href="/research" className="transition hover:text-ember">
                  Research Program
                </a>
              </li>
              <li>
                <a href="/search" className="transition hover:text-ember">
                  Search
                </a>
              </li>
              <li className="text-meta text-[13px] font-sans pt-2">
                Built {buildDate}
              </li>
              <li className="text-meta text-[13px] font-sans">
                Refreshed every 6h
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
