export function Interpretation({
  title = "结果解读",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="my-8 overflow-hidden rounded-sm border border-rule-strong bg-cream-elevated">
      <header className="border-b border-rule-strong bg-ink px-5 py-2">
        <span className="eyebrow-strong text-cream">{title}</span>
      </header>
      <div className="px-5 py-4 text-[14.5px] leading-[1.85] text-ink">
        {children}
      </div>
    </section>
  );
}
