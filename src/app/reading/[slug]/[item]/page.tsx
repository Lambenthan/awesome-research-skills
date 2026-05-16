import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { DetailShell } from "@/components/DetailShell";
import { articles } from "@/lib/data";
import { allItemParams } from "@/lib/sections";

export function generateStaticParams() {
  return allItemParams("reading");
}

type Params = Promise<{ slug: string; item: string }>;

export default async function ReadingItemPage({
  params,
}: {
  params: Params;
}) {
  const { slug, item } = await params;
  const category = articles.find((c) => c.id === slug);
  if (!category) notFound();
  const a = category.items.find((it) => it.itemSlug === item);
  if (!a) notFound();

  const siblings = category.items
    .filter((it) => it.itemSlug !== item)
    .map((it) => ({ itemSlug: it.itemSlug, title: it.title }));

  type Attr = { label: string; value: React.ReactNode };
  const attrs: Attr[] = [
    { label: "Source", value: a.source },
  ];
  if (a.date) attrs.push({ label: "Date", value: a.date });
  attrs.push({
    label: "URL",
    value: (
      <a
        href={a.url}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-ember hover:underline"
      >
        {a.url}
      </a>
    ),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-14">
        <DetailShell
          section="reading"
          categoryId={category.id}
          categoryLabel={category.label}
          title={a.title}
          cn={a.cn}
          description={a.blurb}
          attributes={attrs}
          externalLabel="阅读原文"
          externalHref={a.url}
          siblings={siblings}
        />
      </main>
      <Footer />
    </div>
  );
}
