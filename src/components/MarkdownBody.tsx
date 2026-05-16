import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Compact markdown renderer used by item detail pages for SKILL.md bodies
 * and README excerpts. Styling lives in globals.css under .prose-detail so
 * each element looks integrated with the rest of the editorial design.
 */
export function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="prose-detail">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </div>
  );
}
