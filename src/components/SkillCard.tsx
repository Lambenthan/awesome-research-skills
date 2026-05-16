import Link from "next/link";
import type { SkillItem } from "@/lib/types";

export function SkillCard({
  item,
  href,
}: {
  item: SkillItem;
  href: string;
}) {
  return (
    <Link href={href} className="card group flex h-full flex-col p-6">
      <h3 className="font-serif text-[19px] leading-tight text-ink transition group-hover:text-ember">
        {item.name}
      </h3>
      <p className="mt-1 font-mono text-[11px] text-ink-subtle">{item.repo}</p>
      <p className="mt-3 line-clamp-5 text-[13.5px] leading-[1.65] text-ink-muted">
        {item.cn || item.description || "—"}
      </p>
      <div className="mt-auto pt-4">
        <span className="eyebrow-strong text-ember transition group-hover:text-ink">
          Open →
        </span>
      </div>
    </Link>
  );
}
