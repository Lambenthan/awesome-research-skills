const REPO_URL = "https://github.com/Lambenthan/field-notes";

export function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-[88rem] flex-wrap items-center justify-between gap-3 px-6 py-6">
        <p className="eyebrow">
          白名单 ·{" "}
          <span className="font-mono normal-case tracking-normal text-ink-muted">
            content/featured-skills.yml
          </span>
          {" + "}
          <span className="font-mono normal-case tracking-normal text-ink-muted">
            content/featured-repos.yml
          </span>
        </p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow transition hover:text-ink"
        >
          Source on GitHub →
        </a>
      </div>
    </footer>
  );
}
