import type { RepoItem } from "@/lib/types";

function formatStars(n?: number) {
  if (n === undefined || n === null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function RepoCard({ item }: { item: RepoItem }) {
  if (item.fetchFailed) {
    return (
      <article className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5">
        <div className="font-mono text-sm text-stone-700">{item.fullName}</div>
        <p className="mt-1 text-xs text-stone-500">
          GitHub 数据抓取失败，可能是限频或仓库已删除。
        </p>
      </article>
    );
  }
  const url = item.url || `https://github.com/${item.fullName}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-stone-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-mono text-sm font-semibold text-stone-900 group-hover:text-indigo-700">
          {item.fullName}
        </h3>
        <span className="shrink-0 text-xs font-medium text-amber-700">
          ★ {formatStars(item.stars)}
        </span>
      </div>
      <p className="line-clamp-3 text-sm leading-relaxed text-stone-600">
        {item.description || "—"}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.language && (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
            {item.language}
          </span>
        )}
        {item.license && (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
            {item.license}
          </span>
        )}
        {(item.topics ?? []).slice(0, 3).map((topic) => (
          <span
            key={topic}
            className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
          >
            {topic}
          </span>
        ))}
      </div>
    </a>
  );
}
