import Link from "next/link";
import type { SkillItem } from "@/lib/types";

export function SkillRow({
  item,
  index,
  href,
}: {
  item: SkillItem;
  index: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block border-t border-rule py-7 first:border-t-0 first:pt-0"
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-1">
          <span className="font-serif text-[14px] tabular-nums text-ink-subtle">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="col-span-12 sm:col-span-8">
          <h3 className="font-serif text-[24px] leading-tight text-ink transition group-hover:text-ember">
            {item.name}
          </h3>
          <p className="mt-1 font-mono text-[11.5px] text-ink-subtle">
            {item.repo}
          </p>
          <p className="mt-3 max-w-3xl text-[14px] leading-[1.7] text-ink-muted">
            {item.cn || item.description || "—"}
          </p>
        </div>
        <div className="col-span-12 flex sm:col-span-3 sm:justify-end">
          <span className="eyebrow-strong text-ember transition group-hover:text-ink">
            Open →
          </span>
        </div>
      </div>
    </Link>
  );
}
