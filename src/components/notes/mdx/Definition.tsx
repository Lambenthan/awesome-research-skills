export function Definition({
  title,
  label,
  children,
}: {
  title?: string;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="my-7 rounded-r-sm border-l-[3px] border-l-ink bg-cream-surface/50 px-5 py-4">
      <header className="mb-2.5 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <span className="eyebrow text-ink">定义</span>
          {title && (
            <span className="font-serif text-[15.5px] italic leading-snug text-ink">
              {title}
            </span>
          )}
        </div>
        {label && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
            {label}
          </span>
        )}
      </header>
      <div className="defn-body text-[14.5px] leading-[1.85] text-ink">
        {children}
      </div>
    </section>
  );
}
