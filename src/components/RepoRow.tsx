import type { RepoItem } from "@/lib/types";

function formatStars(n?: number) {
  if (n === undefined || n === null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export function RepoRow({ item, index }: { item: RepoItem; index: number }) {
  if (item.fetchFailed) {
    return (
      <article className="border-t border-dashed border-rule py-6 text-ink-subtle">
        <div className="font-mono text-[13.5px]">{item.fullName}</div>
        <p className="mt-2 text-[12.5px]">
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
      className="group block border-t border-rule py-7 first:border-t-0 first:pt-0"
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-1">
          <span className="font-serif text-[14px] tabular-nums text-ink-subtle">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="col-span-12 sm:col-span-8">
          <h3 className="font-mono text-[16px] leading-tight text-ink transition group-hover:text-ember">
            <span className="text-ink-subtle">{owner}/</span>
            <span className="font-medium">{name}</span>
          </h3>
          <p className="mt-3 max-w-3xl text-[14px] leading-[1.7] text-ink-muted">
            {item.description || "—"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            {item.language && <span className="eyebrow">{item.language}</span>}
            {item.license && (
              <span className="eyebrow text-ink-subtle">{item.license}</span>
            )}
            {(item.topics ?? []).slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-rule px-2 py-0.5 text-[10.5px] text-ink-muted"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
        <div className="col-span-12 flex items-baseline gap-2 sm:col-span-3 sm:justify-end">
          <span className="font-serif text-[26px] leading-none text-ember">
            ★ {formatStars(item.stars)}
          </span>
        </div>
      </div>
    </a>
  );
}
