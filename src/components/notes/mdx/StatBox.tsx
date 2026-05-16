export function StatBox({
  title = "方法卡片",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="my-8 overflow-hidden rounded-sm border border-ember/40 bg-ember-tint/40">
      <header className="border-b border-ember/40 bg-ember px-5 py-2">
        <span className="eyebrow-strong text-cream">{title}</span>
      </header>
      <div className="px-5 py-4 text-[14.5px] leading-[1.85] text-ink">
        {children}
      </div>
    </section>
  );
}
