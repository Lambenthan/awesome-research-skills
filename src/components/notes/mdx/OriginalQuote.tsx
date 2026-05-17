export function OriginalQuote({
  title = "传习录原文",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="my-7 rounded-r-sm border-l-[3px] border-l-rule-strong bg-cream-surface/60 px-5 py-4">
      <header className="mb-2.5 flex items-baseline gap-2.5">
        <span className="eyebrow text-ink-subtle">{title}</span>
      </header>
      <div className="font-serif text-[15.5px] italic leading-[1.9] text-ink">
        {children}
      </div>
    </section>
  );
}
