import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { CategoryView } from "@/components/CategoryView";
import { articles } from "@/lib/data";

export function generateStaticParams() {
  return articles.map((c) => ({ slug: c.id }));
}

type Params = Promise<{ slug: string }>;

export default async function ReadingCategoryPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const category = articles.find((c) => c.id === slug);
  if (!category) notFound();
  const siblings = articles.map((c) => ({ id: c.id, label: c.label }));
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <CategoryView
          section="reading"
          category={category}
          siblings={siblings}
        />
      </main>
      <Footer />
    </div>
  );
}
