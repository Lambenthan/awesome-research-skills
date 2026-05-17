import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { CategoryView } from "@/components/CategoryView";
import { repos } from "@/lib/data";

export function generateStaticParams() {
  return repos.ai.map((g) => ({ slug: g.id }));
}

type Params = Promise<{ slug: string }>;

export default async function AiCategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = repos.ai.find((g) => g.id === slug);
  if (!category) notFound();
  const siblings = repos.ai.map((g) => ({ id: g.id, label: g.label }));
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-6 py-16">
        <CategoryView section="ai" category={category} siblings={siblings} />
      </main>
      <Footer />
    </div>
  );
}
