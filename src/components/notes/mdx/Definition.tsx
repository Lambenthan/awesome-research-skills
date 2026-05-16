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
    <section className="my-8 overflow-hidden rounded-sm border border-rule-strong bg-cream-elevated">
      <header className="flex items-baseline justify-between gap-3 border-b border-rule-strong bg-ink px-5 py-2">
        <span className="eyebrow-strong text-cream">
          定义{title ? `　${title}` : ""}
        </span>
        {label && (
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-cream/60">
            {label}
          </span>
        )}
      </header>
      <div className="defn-body px-5 py-4 text-[14.5px] leading-[1.85] text-ink">
        {children}
      </div>
    </section>
  );
}
