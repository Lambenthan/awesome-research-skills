import type { SkillItem } from "@/lib/types";

export function SkillRow({ item, index }: { item: SkillItem; index: number }) {
  return (
    <article className="group border-t border-rule py-7 first:border-t-0 first:pt-0">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-1">
          <span className="font-serif text-[14px] tabular-nums text-ink-subtle">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="col-span-12 sm:col-span-8">
          <a
            href={item.skillsShUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="font-serif text-[24px] leading-tight text-ink transition group-hover:text-ember">
              {item.name}
            </h3>
            <p className="mt-1 font-mono text-[11.5px] text-ink-subtle">
              {item.repo}
            </p>
            <p className="mt-3 max-w-3xl text-[14px] leading-[1.7] text-ink-muted">
              {item.description || "—"}
            </p>
          </a>
        </div>
        <div className="col-span-12 flex flex-col items-start gap-2 sm:col-span-3 sm:items-end">
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
      </div>
    </article>
  );
}
