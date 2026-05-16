import type { SkillItem } from "@/lib/types";

export function SkillCard({ item }: { item: SkillItem }) {
  return (
    <article className="card group flex h-full flex-col p-6">
      <a
        href={item.skillsShUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col"
      >
        <h3 className="font-serif text-[19px] leading-tight text-ink transition group-hover:text-ember">
          {item.name}
        </h3>
        <p className="mt-1 font-mono text-[11px] text-ink-subtle">
          {item.repo}
        </p>
        <p className="mt-3 line-clamp-5 text-[13.5px] leading-[1.65] text-ink-muted">
          {item.description || "—"}
        </p>
      </a>
      <div className="mt-5 flex items-center justify-between border-t border-rule pt-3">
        <a
          href={item.skillsShUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow-strong text-ember transition hover:text-ink"
        >
          skills.sh →
        </a>
        <a
          href={item.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow transition hover:text-ink"
        >
          GitHub →
        </a>
      </div>
    </article>
  );
}
