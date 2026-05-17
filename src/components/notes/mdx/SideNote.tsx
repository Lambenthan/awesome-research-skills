/**
 * Side margin note for chapter prose. On large screens (>= 1280px), the
 * note floats into the right margin reserved by the chapter layout. On
 * narrower screens it renders inline as a soft callout right after the
 * paragraph that referenced it.
 *
 * Use for short glossary entries that gloss a technical term the reader
 * just encountered. Aim for 40-120 字 per note. The `term` prop shows as
 * a small serif heading inside the note.
 */
export function SideNote({
  term,
  children,
}: {
  term?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="sidenote">
      {term && <span className="sidenote-term">{term}</span>}
      <span className="sidenote-body">{children}</span>
    </aside>
  );
}
