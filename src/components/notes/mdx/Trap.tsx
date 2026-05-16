export function Trap({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="my-8 overflow-hidden rounded-sm border border-[#c15f3c]/40 bg-[#fdf5f1]">
      <header className="border-b border-[#c15f3c]/30 bg-[#c15f3c] px-5 py-2">
        <span className="eyebrow-strong text-cream">
          雷区{title ? `　${title}` : ""}
        </span>
      </header>
      <div className="trap-body px-5 py-4 text-[14.5px] leading-[1.85] text-ink">
        {children}
      </div>
    </section>
  );
}
