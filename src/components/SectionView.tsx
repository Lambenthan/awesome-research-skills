"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  ArticleCategory,
  ArticleItem,
  RepoGroup,
  SkillCategory,
  SkillItem,
  RepoItem,
} from "@/lib/types";
import { SkillCard } from "./SkillCard";
import { RepoCard } from "./RepoCard";
import { ArticleCard } from "./ArticleCard";
import type { SectionId } from "@/lib/sections";

type Props =
  | { section: "skills"; basePath: string; groups: SkillCategory[] }
  | { section: "ai"; basePath: string; groups: RepoGroup[] }
  | { section: "reading"; basePath: string; groups: ArticleCategory[] };

export function SectionView(props: Props) {
  const { section, basePath, groups } = props;
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  const lowerQ = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const inActive = (id: string) => activeCat === "all" || activeCat === id;
    if (section === "skills") {
      return (groups as SkillCategory[])
        .filter((c) => inActive(c.id))
        .map((c) => ({
          ...c,
          items: c.items.filter((it) => matchSkill(it, lowerQ)) as SkillItem[],
        }))
        .filter((c) => c.items.length > 0);
    }
    if (section === "reading") {
      return (groups as ArticleCategory[])
        .filter((c) => inActive(c.id))
        .map((c) => ({
          ...c,
          items: c.items.filter((it) =>
            matchArticle(it, lowerQ),
          ) as ArticleItem[],
        }))
        .filter((c) => c.items.length > 0);
    }
    return (groups as RepoGroup[])
      .filter((g) => inActive(g.id))
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => matchRepo(it, lowerQ)) as RepoItem[],
      }))
      .filter((g) => g.items.length > 0);
  }, [section, groups, lowerQ, activeCat]);

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-rule pb-3">
          <span className="eyebrow shrink-0">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="按名称、描述、topic 过滤…"
            aria-label={
              section === "skills"
                ? "Search skills"
                : section === "reading"
                  ? "Search articles"
                  : "Search repositories"
            }
            className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-subtle outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="eyebrow shrink-0 hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            active={activeCat === "all"}
            onClick={() => setActiveCat("all")}
          >
            全部
          </FilterChip>
          {groups.map((g) => (
            <FilterChip
              key={g.id}
              active={activeCat === g.id}
              onClick={() => setActiveCat(g.id)}
            >
              {g.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          what={
            section === "skills"
              ? "skill"
              : section === "reading"
                ? "article"
                : "项目"
          }
          hint={lowerQ}
        />
      ) : (
        <div className="space-y-14">
          {filtered.map((g) => (
            <section key={g.id} id={g.id}>
              <SectionHeader
                label={g.label}
                summary={g.summary}
                count={g.items.length}
                href={`${basePath}/${g.id}/`}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section === "skills"
                  ? (g.items as SkillItem[]).map((it) => (
                      <SkillCard
                        key={it.slug + it.repo}
                        item={it}
                        href={`${basePath}/${g.id}/${it.itemSlug}`}
                      />
                    ))
                  : section === "reading"
                    ? (g.items as ArticleItem[]).map((it) => (
                        <ArticleCard
                          key={it.url}
                          item={it}
                          href={`${basePath}/${g.id}/${it.itemSlug}`}
                        />
                      ))
                    : (g.items as RepoItem[]).map((it) => (
                        <RepoCard
                          key={it.fullName}
                          item={it}
                          href={`${basePath}/${g.id}/${it.itemSlug}`}
                        />
                      ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function matchSkill(item: SkillItem, q: string) {
  if (!q) return true;
  return `${item.name} ${item.description} ${item.repo}`.toLowerCase().includes(q);
}
function matchRepo(item: RepoItem, q: string) {
  if (!q) return true;
  return `${item.fullName} ${item.description ?? ""} ${(item.topics ?? []).join(" ")}`
    .toLowerCase()
    .includes(q);
}
function matchArticle(item: ArticleItem, q: string) {
  if (!q) return true;
  return `${item.title} ${item.blurb ?? ""} ${item.source}`
    .toLowerCase()
    .includes(q);
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`rounded-full border px-3 py-1 text-[12px] transition ${
        active
          ? "border-ember bg-ember-tint text-ember"
          : "border-rule text-ink-muted hover:border-rule-strong hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function SectionHeader({
  label,
  summary,
  count,
  href,
}: {
  label: string;
  summary?: string;
  count: number;
  href: string;
}) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-rule pb-3">
      <div>
        <Link href={href} className="group inline-flex items-baseline gap-3">
          <h2 className="font-serif text-[22px] leading-tight text-ink transition group-hover:text-ember">
            {label}
          </h2>
          <span className="eyebrow transition group-hover:text-ember">
            View all →
          </span>
        </Link>
        {summary && (
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
            {summary}
          </p>
        )}
      </div>
      <span className="eyebrow shrink-0">{count} items</span>
    </div>
  );
}

function EmptyState({ what, hint }: { what: string; hint: string }) {
  return (
    <div className="border border-dashed border-rule py-16 text-center">
      <p className="eyebrow">No match</p>
      <p className="mt-3 text-[15px] text-ink-muted">
        没有匹配的{what}
        {hint ? (
          <>
            （&ldquo;<span className="font-mono text-ink">{hint}</span>&rdquo;）
          </>
        ) : null}
        。
      </p>
    </div>
  );
}

export type { SectionId };
