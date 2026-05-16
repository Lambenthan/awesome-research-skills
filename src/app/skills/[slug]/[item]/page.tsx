import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { DetailShell } from "@/components/DetailShell";
import { MarkdownBody } from "@/components/MarkdownBody";
import { skills } from "@/lib/data";
import { allItemParams } from "@/lib/sections";
import type { SkillItem } from "@/lib/types";

export function generateStaticParams() {
  return allItemParams("skills");
}

type Params = Promise<{ slug: string; item: string }>;

export default async function SkillItemPage({ params }: { params: Params }) {
  const { slug, item } = await params;
  const category = skills.find((c) => c.id === slug);
  if (!category) notFound();
  const sk = category.items.find((it) => it.itemSlug === item) as
    | SkillItem
    | undefined;
  if (!sk) notFound();

  const siblings = category.items
    .filter((it) => it.itemSlug !== item)
    .map((it) => ({ itemSlug: it.itemSlug, title: it.name }));

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-14">
        <DetailShell
          section="skills"
          categoryId={category.id}
          categoryLabel={category.label}
          title={sk.name}
          cn={sk.cn}
          description={sk.description}
          attributes={[
            { label: "Repo", value: <code className="font-mono text-[12.5px]">{sk.repo}</code> },
            { label: "skills.sh", value: (
              <a href={sk.skillsShUrl} target="_blank" rel="noopener noreferrer" className="text-ember hover:underline">{`/${sk.repo}/${sk.slug}`}</a>
            )},
            { label: "Slug", value: <code className="font-mono text-[12.5px]">{sk.slug}</code> },
          ]}
          bodyHeading={sk.body ? "SKILL.md" : undefined}
          body={sk.body ? <MarkdownBody source={sk.body} /> : undefined}
          externalLabel="skills.sh 详情页"
          externalHref={sk.skillsShUrl}
          secondaryHref={sk.githubUrl}
          secondaryLabel="GitHub 源目录"
          siblings={siblings}
        />
      </main>
      <Footer />
    </div>
  );
}
