import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <nav className="eyebrow flex flex-wrap items-center gap-x-2 gap-y-1">
      {trail.map((c, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={i} className="inline-flex items-center gap-2">
            {c.href && !isLast ? (
              <Link href={c.href} className="transition hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span className={isLast ? "text-ink" : ""}>{c.label}</span>
            )}
            {!isLast && <span className="text-ink-subtle">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
