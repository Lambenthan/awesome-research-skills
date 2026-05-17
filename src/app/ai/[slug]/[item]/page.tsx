import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { DetailShell } from "@/components/DetailShell";
import { MarkdownBody } from "@/components/MarkdownBody";
import { repos } from "@/lib/data";
import { allItemParams } from "@/lib/sections";
import type { RepoItem } from "@/lib/types";

export function generateStaticParams() {
  return allItemParams("ai");
}

type Params = Promise<{ slug: string; item: string }>;

export default async function AiItemPage({ params }: { params: Params }) {
  const { slug, item } = await params;
  return repoDetail(repos.ai, slug, item, "ai");
}

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

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const days = Math.round((Date.now() - t) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return new Date(t).toISOString().slice(0, 10);
}

export function repoDetail(
  groups: { id: string; label: string; items: RepoItem[] }[],
  slug: string,
  item: string,
  section: "ai" = "ai",
) {
  const category = groups.find((c) => c.id === slug);
  if (!category) notFound();
  const r = category.items.find((it) => it.itemSlug === item);
  if (!r) notFound();

  const siblings = category.items
    .filter((it) => it.itemSlug !== item)
    .map((it) => ({ itemSlug: it.itemSlug, title: it.fullName }));

  type Attr = { label: string; value: React.ReactNode };
  const attrs: Attr[] = [
    { label: "Repo", value: (
      <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[12.5px] text-ember hover:underline">
        {r.fullName}
      </a>
    )},
    { label: "Stars", value: (
      <span>
        ★ {formatStars(r.stars)}
        {formatDelta(r.starsDelta7d) && (
          <span className="ml-2 text-[11px] text-ember/80">{formatDelta(r.starsDelta7d)} / 7d</span>
        )}
      </span>
    )},
  ];
  if (r.language) attrs.push({ label: "Language", value: r.language });
  if (r.license) attrs.push({ label: "License", value: r.license });
  if (r.pushedAt) attrs.push({ label: "Last push", value: timeAgo(r.pushedAt) });
  if (r.createdAt) attrs.push({ label: "Created", value: new Date(r.createdAt).toISOString().slice(0, 10) });
  if (r.topics && r.topics.length) {
    attrs.push({
      label: "Topics",
      value: (
        <span className="flex flex-wrap gap-1.5">
          {r.topics!.slice(0, 6).map((t) => (
            <span key={t} className="rounded-full border border-rule px-2 py-0.5 text-[10.5px]">
              {t}
            </span>
          ))}
        </span>
      ),
    });
  }
  if (r.homepage) {
    attrs.push({
      label: "Homepage",
      value: (
        <a href={r.homepage} target="_blank" rel="noopener noreferrer" className="break-all text-ember hover:underline">
          {r.homepage}
        </a>
      ),
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-6 py-14">
        <DetailShell
          section={section}
          categoryId={category.id}
          categoryLabel={category.label}
          title={r.fullName}
          cn={r.cn}
          description={r.description}
          attributes={attrs}
          bodyHeading={r.readme ? "README" : undefined}
          body={r.readme ? <MarkdownBody source={r.readme} /> : undefined}
          externalLabel="在 GitHub 打开"
          externalHref={r.url || `https://github.com/${r.fullName}`}
          siblings={siblings}
        />
      </main>
      <Footer />
    </div>
  );
}
