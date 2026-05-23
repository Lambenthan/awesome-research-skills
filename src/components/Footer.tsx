import { meta } from "@/lib/data";

const REPO_URL = "https://github.com/Lambenthan/field-notes";

export function Footer() {
  const buildDate = meta.builtAt
    ? new Date(meta.builtAt).toISOString().slice(0, 10)
    : "—";
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto max-w-[88rem] px-6 py-12 sm:py-16">
        <div className="grid grid-cols-12 gap-x-8 gap-y-10">
          {/* Identity */}
          <div className="col-span-12 sm:col-span-5">
            <p className="font-serif text-[18px] italic leading-none text-ink">
              Field Notes
            </p>
            <p className="mt-3 text-[13px] leading-[1.7] text-ink-muted">
              田野笔记 · 晨瀚宇个人站点。整理用过的工具、读过的论文、写过的十本书稿，与每天跟踪的 AI 一手动态。
            </p>
          </div>

          {/* Navigation echo */}
          <div className="col-span-6 sm:col-span-3">
            <p className="eyebrow text-ink-subtle">Index</p>
            <ul className="mt-4 space-y-2 text-[13px] text-ink">
              <li>
                <a href="/skills" className="transition hover:text-ember">
                  Claude Code Skills
                </a>
              </li>
              <li>
                <a href="/ai" className="transition hover:text-ember">
                  AI Open Source
                </a>
              </li>
              <li>
                <a href="/reading" className="transition hover:text-ember">
                  Reading
                </a>
              </li>
              <li>
                <a href="/notes" className="transition hover:text-ember">
                  Research Notes
                </a>
              </li>
              <li>
                <a href="/latest" className="transition hover:text-ember">
                  Latest · Live
                </a>
              </li>
              <li>
                <a href="/research" className="transition hover:text-ember">
                  Parallax · 视差
                </a>
              </li>
            </ul>
          </div>

          {/* Meta */}
          <div className="col-span-6 sm:col-span-4">
            <p className="eyebrow text-ink-subtle">Meta</p>
            <ul className="mt-4 space-y-2 text-[13px] text-ink">
              <li>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-ember"
                >
                  Source on GitHub →
                </a>
              </li>
              <li className="text-ink-muted">
                构建日期 <span className="text-ink">{buildDate}</span>
              </li>
              <li className="text-ink-muted">
                每 6 小时 GitHub Actions cron 刷新动态
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-baseline justify-between gap-3 border-t border-rule pt-6">
          <p className="eyebrow text-ink-subtle">
            © {new Date().getFullYear()} Chanw · Independent research
          </p>
          <p className="eyebrow text-ink-subtle">
            通过 AI 拓展科研方法的边界
          </p>
        </div>
      </div>
    </footer>
  );
}
