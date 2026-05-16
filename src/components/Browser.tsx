"use client";

import { useMemo, useState } from "react";
import type { ReposData, SkillCategory } from "@/lib/types";
import { SkillCard } from "./SkillCard";
import { RepoCard } from "./RepoCard";

type Tab = "skills" | "ai" | "research";

const TABS: Array<{ id: Tab; label: string; hint: string }> = [
  { id: "skills", label: "Claude Code Skills", hint: "本地已装、研究向" },
  { id: "ai", label: "AI 开源项目", hint: "Agent / LLM / RAG" },
  { id: "research", label: "科研工具", hint: "数据 / 统计 / 生信 / 写作" },
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
          const hay = `${item.name} ${item.description}`.toLowerCase();
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setActiveCat("all");
            }}
            className={`relative -mb-px px-4 py-2.5 text-sm font-medium transition ${
              tab === t.id
                ? "border-b-2 border-indigo-600 text-indigo-700"
                : "border-b-2 border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.label}
            <span className="ml-2 hidden text-xs text-stone-400 sm:inline">
              {t.hint}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索名称、描述、topic…"
          className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:max-w-md"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCat("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              activeCat === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100"
            }`}
          >
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeCat === c.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100"
              }`}
            >
              {c.label}
            </button>
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

function SkillSections({
  groups,
  emptyHint,
}: {
  groups: SkillCategory[];
  emptyHint: string;
}) {
  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
        没有匹配的 skill{emptyHint ? `（"${emptyHint}"）` : ""}。
      </p>
    );
  }
  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <section key={g.id}>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-stone-900">{g.label}</h2>
            {g.summary && (
              <p className="mt-1 text-sm text-stone-500">{g.summary}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((item) => (
              <SkillCard key={item.slug} item={item} />
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
    return (
      <p className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
        没有匹配的项目{emptyHint ? `（"${emptyHint}"）` : ""}。
      </p>
    );
  }
  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <section key={g.id}>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-stone-900">{g.label}</h2>
            {g.summary && (
              <p className="mt-1 text-sm text-stone-500">{g.summary}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((item) => (
              <RepoCard key={item.fullName} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
