import type { SkillItem } from "@/lib/types";

export function SkillCard({ item }: { item: SkillItem }) {
  return (
    <article className="group rounded-xl border border-stone-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm">
      <a
        href={item.skillsShUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <h3 className="font-mono text-sm font-semibold text-stone-900 group-hover:text-indigo-700">
            {item.name}
          </h3>
        </div>
        <p className="mb-2 font-mono text-xs text-stone-400">{item.repo}</p>
        <p className="line-clamp-4 text-sm leading-relaxed text-stone-600">
          {item.description || "—"}
        </p>
      </a>
      <div className="mt-3 flex gap-3 text-xs">
        <a
          href={item.skillsShUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          skills.sh ↗
        </a>
        <a
          href={item.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-600 hover:underline"
        >
          GitHub ↗
        </a>
      </div>
    </article>
  );
}
