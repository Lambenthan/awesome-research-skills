import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { CategoryView } from "@/components/CategoryView";
import { repos } from "@/lib/data";

export function generateStaticParams() {
  return repos.research.map((g) => ({ slug: g.id }));
}

type Params = Promise<{ slug: string }>;

export default async function ResearchCategoryPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const category = repos.research.find((g) => g.id === slug);
  if (!category) notFound();
  const siblings = repos.research.map((g) => ({ id: g.id, label: g.label }));
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-6 py-16">
        <CategoryView
          section="research"
          category={category}
          siblings={siblings}
        />
      </main>
      <Footer />
    </div>
  );
}
