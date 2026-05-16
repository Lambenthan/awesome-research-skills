export function Introduction({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <aside className="my-10 rounded-sm border border-rule bg-cream-surface/70 px-6 py-5 not-prose">
      <p className="eyebrow mb-3">本章要点</p>
      <div className="intro-list text-[14.5px] leading-[1.8] text-ink">
        {children}
      </div>
    </aside>
  );
}
