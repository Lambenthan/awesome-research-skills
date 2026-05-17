/**
 * Inline marker that flags a term as having an adjacent SideNote on
 * wide screens. Renders the term with a dotted ember underline so the
 * reader can spot where margin glosses apply. On narrow screens it
 * still looks distinct from regular prose, working as a visual cue
 * even when the SideNote itself collapses to inline.
 */
export function NoteRef({ children }: { children: React.ReactNode }) {
  return <span className="note-ref">{children}</span>;
}
