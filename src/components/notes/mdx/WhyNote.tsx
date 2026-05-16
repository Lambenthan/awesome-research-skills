export function WhyNote({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="my-8 border-l-2 border-ember bg-ember-tint/60 px-6 py-4">
      {title && (
        <p className="font-serif text-[15px] font-medium italic leading-snug text-ember">
          {title}
        </p>
      )}
      <div className="why-body mt-2 text-[14.5px] leading-[1.85] text-ink">
        {children}
      </div>
    </aside>
  );
}
