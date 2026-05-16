import Link from "next/link";
import type { RepoGroup, SkillCategory } from "@/lib/types";
import { Breadcrumb } from "./Breadcrumb";
import { SkillRow } from "./SkillRow";
import { RepoRow } from "./RepoRow";
import { SECTION_META, type SectionId } from "@/lib/sections";

type Props =
  | {
      section: "skills";
      category: SkillCategory;
      siblings: { id: string; label: string }[];
    }
  | {
      section: "ai" | "research";
      category: RepoGroup;
      siblings: { id: string; label: string }[];
    };

export function CategoryView(props: Props) {
  const { section, category, siblings } = props;
  const meta = SECTION_META[section as SectionId];
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <Breadcrumb
          trail={[
            { label: "Home", href: "/" },
            { label: meta.eyebrow, href: meta.href },
            { label: category.label },
          ]}
        />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 sm:col-span-8">
            <p className="eyebrow">{meta.eyebrow} · Category</p>
            <h1 className="display mt-4 text-[42px] text-ink sm:text-[56px]">
              {category.label}
            </h1>
            {category.summary && (
              <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-ink-muted">
                {category.summary}
              </p>
            )}
          </div>
          <div className="col-span-12 sm:col-span-4 sm:text-right">
            <p className="eyebrow">In this category</p>
            <p className="mt-2 font-serif text-[42px] leading-none text-ink">
              {category.items.length}
            </p>
            <p className="mt-1 eyebrow text-ink-subtle">items</p>
          </div>
        </div>
      </div>

      {siblings.length > 1 && (
        <div className="border-y border-rule py-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="eyebrow shrink-0">Other categories</span>
            {siblings
              .filter((s) => s.id !== category.id)
              .map((s) => (
                <Link
                  key={s.id}
                  href={`${meta.href}/${s.id}/`}
                  className="text-[13px] text-ink-muted transition hover:text-ember"
                >
                  {s.label}
                </Link>
              ))}
          </div>
        </div>
      )}

      <div>
        {section === "skills"
          ? (category as SkillCategory).items.map((it, i) => (
              <SkillRow key={it.slug + it.repo} item={it} index={i} />
            ))
          : (category as RepoGroup).items.map((it, i) => (
              <RepoRow key={it.fullName} item={it} index={i} />
            ))}
      </div>

      <div className="border-t border-rule pt-6">
        <Link
          href={meta.href}
          className="eyebrow transition hover:text-ember"
        >
          ← All of {meta.eyebrow}
        </Link>
      </div>
    </div>
  );
}
