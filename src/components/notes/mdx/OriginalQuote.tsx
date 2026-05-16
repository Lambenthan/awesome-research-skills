export function OriginalQuote({
  title = "传习录原文",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="my-8 overflow-hidden rounded-sm border border-rule bg-cream-surface/70">
      <header className="border-b border-rule px-5 py-2">
        <span className="eyebrow">{title}</span>
      </header>
      <div className="px-6 py-5 font-serif text-[15.5px] italic leading-[1.9] text-ink">
        {children}
      </div>
    </section>
  );
}
