export function StatBox({
  title = "方法卡片",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const isDefault = title === "方法卡片";
  return (
    <section className="my-7 rounded-r-sm border-l-[3px] border-l-ember-soft bg-[#fdf7f3] px-5 py-4">
      <header className="mb-2.5 flex items-baseline gap-2.5">
        <span className="eyebrow text-ember">方法卡片</span>
        {!isDefault && (
          <span className="font-serif text-[15.5px] italic leading-snug text-ink">
            {title}
          </span>
        )}
      </header>
      <div className="text-[14.5px] leading-[1.85] text-ink">{children}</div>
    </section>
  );
}
