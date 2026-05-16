import type { MDXComponents } from "mdx/types";
import { Introduction } from "@/components/notes/mdx/Introduction";
import { WhyNote } from "@/components/notes/mdx/WhyNote";
import { Interpretation } from "@/components/notes/mdx/Interpretation";
import { StatBox } from "@/components/notes/mdx/StatBox";
import { OriginalQuote } from "@/components/notes/mdx/OriginalQuote";
import { ChapterFigure } from "@/components/notes/mdx/ChapterFigure";

export function useMDXComponents(
  components: MDXComponents,
): MDXComponents {
  return {
    ...components,
    Introduction,
    WhyNote,
    Interpretation,
    StatBox,
    OriginalQuote,
    ChapterFigure,
  };
}
