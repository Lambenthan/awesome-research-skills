"use client";

import { useMemo, useState } from "react";
import type { ReposData, SkillCategory } from "@/lib/types";
import { SkillCard } from "./SkillCard";
import { RepoCard } from "./RepoCard";

type Tab = "skills" | "ai" | "research";

const TABS: Array<{ id: Tab; label: string; hint: string }> = [
  { id: "skills", label: "Claude Code Skills", hint: "公开仓库收录" },
  { id: "ai", label: "AI Open Source", hint: "Agent · LLM · RAG" },
  { id: "research", label: "Research Tools", hint: "数据 · 统计 · 生信 · 写作" },
];

export function Browser({
  skills,
  repos,
}: {
  skills: SkillCategory[];
  repos: ReposData;
}) {
  const [tab, setTab] = useState<Tab>("skills");
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  const lowerQ = query.trim().toLowerCase();

  const skillResult = useMemo(() => {
    if (tab !== "skills") return null;
    return skills
      .filter((c) => activeCat === "all" || activeCat === c.id)
      .map((c) => ({
        ...c,
        items: c.items.filter((item) => {
          if (!lowerQ) return true;
          const hay = `${item.name} ${item.description} ${item.repo}`.toLowerCase();
          return hay.includes(lowerQ);
        }),
      }))
      .filter((c) => c.items.length > 0);
  }, [tab, skills, lowerQ, activeCat]);

  const repoResult = useMemo(() => {
    if (tab === "skills") return null;
    const groups = tab === "ai" ? repos.ai : repos.research;
    return groups
      .filter((g) => activeCat === "all" || activeCat === g.id)
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          if (!lowerQ) return true;
          const hay = `${item.fullName} ${item.description ?? ""} ${(item.topics ?? []).join(" ")}`.toLowerCase();
          return hay.includes(lowerQ);
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [tab, repos, lowerQ, activeCat]);

  const categories =
    tab === "skills"
      ? skills.map((c) => ({ id: c.id, label: c.label }))
      : (tab === "ai" ? repos.ai : repos.research).map((g) => ({
          id: g.id,
          label: g.label,
        }));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end gap-x-9 gap-y-2 border-b border-rule">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setActiveCat("all");
            }}
            className={`relative -mb-px py-4 text-left transition ${
              tab === t.id
                ? "border-b border-ember text-ink"
                : "border-b border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <span className="text-[15px] font-medium">{t.label}</span>
            <span className="ml-3 hidden text-[11px] text-ink-subtle sm:inline">
              {t.hint}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-rule pb-3">
          <span className="eyebrow shrink-0">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="按名称、描述、topic 过滤…"
            className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-subtle outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="eyebrow shrink-0 hover:text-ink"
              type="button"
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
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              active={activeCat === c.id}
              onClick={() => setActiveCat(c.id)}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {tab === "skills" && (
        <SkillSections groups={skillResult ?? []} emptyHint={lowerQ} />
      )}
      {tab !== "skills" && (
        <RepoSections groups={repoResult ?? []} emptyHint={lowerQ} />
      )}
    </div>
  );
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

function SkillSections({
  groups,
  emptyHint,
}: {
  groups: SkillCategory[];
  emptyHint: string;
}) {
  if (groups.length === 0) {
    return <EmptyState what="skill" hint={emptyHint} />;
  }
  return (
    <div className="space-y-14">
      {groups.map((g) => (
        <section key={g.id}>
          <SectionHeader label={g.label} summary={g.summary} count={g.items.length} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((item) => (
              <SkillCard key={`${g.id}-${item.slug}`} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function RepoSections({
  groups,
  emptyHint,
}: {
  groups: ReposData["ai"];
  emptyHint: string;
}) {
  if (groups.length === 0) {
    return <EmptyState what="项目" hint={emptyHint} />;
  }
  return (
    <div className="space-y-14">
      {groups.map((g) => (
        <section key={g.id}>
          <SectionHeader label={g.label} summary={g.summary} count={g.items.length} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((item) => (
              <RepoCard key={item.fullName} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SectionHeader({
  label,
  summary,
  count,
}: {
  label: string;
  summary?: string;
  count: number;
}) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-rule pb-3">
      <div>
        <h2 className="font-serif text-[22px] leading-tight text-ink">
          {label}
        </h2>
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
