import type { RepoItem } from "@/lib/types";

function formatStars(n?: number) {
  if (n === undefined || n === null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function formatDelta(d?: number) {
  if (d === undefined || d === null || d < 20) return null;
  if (d >= 1000) return `+${(d / 1000).toFixed(1)}k`;
  return `+${d}`;
}

export function RepoCard({ item }: { item: RepoItem }) {
  if (item.fetchFailed) {
    return (
      <article className="border border-dashed border-rule p-6">
        <div className="font-mono text-[13px] text-ink-muted">
          {item.fullName}
        </div>
        <p className="mt-2 text-[12.5px] text-ink-subtle">
          GitHub 数据抓取失败，可能是限频或仓库已删除。
        </p>
      </article>
    );
  }
  const url = item.url || `https://github.com/${item.fullName}`;
  const [owner, name] = item.fullName.split("/");
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="card group flex h-full flex-col p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-[13.5px] leading-snug text-ink transition group-hover:text-ember">
          <span className="text-ink-subtle">{owner}/</span>
          <span className="font-medium">{name}</span>
        </h3>
        <div className="shrink-0 text-right">
          <span className="font-serif text-[15px] leading-none text-ember">
            ★ {formatStars(item.stars)}
          </span>
          {formatDelta(item.starsDelta7d) && (
            <span className="ml-1.5 text-[10px] font-medium tracking-wide text-ember/80">
              {formatDelta(item.starsDelta7d)} · 7d
            </span>
          )}
        </div>
      </div>
      <p className="mt-3 line-clamp-4 text-[13.5px] leading-[1.65] text-ink-muted">
        {item.description || "—"}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-rule pt-3">
        {item.language && (
          <span className="eyebrow">{item.language}</span>
        )}
        {item.license && (
          <span className="eyebrow text-ink-subtle">{item.license}</span>
        )}
        {(item.topics ?? []).slice(0, 2).map((topic) => (
          <span
            key={topic}
            className="rounded-full border border-rule px-2 py-0.5 text-[10.5px] text-ink-muted"
          >
            {topic}
          </span>
        ))}
      </div>
    </a>
  );
}
