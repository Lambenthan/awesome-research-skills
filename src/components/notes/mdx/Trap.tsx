export function Trap({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="my-7 rounded-r-sm border-l-[3px] border-l-ember bg-[#fdf4ef] px-5 py-4">
      <header className="mb-2.5 flex items-baseline gap-2.5">
        <span className="eyebrow text-ember">雷区</span>
        {title && (
          <span className="font-serif text-[15.5px] italic leading-snug text-ink">
            {title}
          </span>
        )}
      </header>
      <div className="trap-body text-[14.5px] leading-[1.85] text-ink">
        {children}
      </div>
    </section>
  );
}
