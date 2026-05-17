import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { LatestDetail } from "@/components/LatestDetail";
import { NavBar } from "@/components/NavBar";
import { latest } from "@/lib/data";
import type { LatestRss } from "@/lib/types";

export function generateStaticParams() {
  return (latest.rss ?? []).map((it) => ({ id: it.id }));
}

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const item = (latest.rss ?? []).find((it) => it.id === id);
  if (!item) return { title: "Not found · Latest" };
  return {
    title: `${item.title} · Latest — Field Notes`,
    description: item.cn || item.summary || item.title,
  };
}

export default async function LatestItemPage({ params }: { params: Params }) {
  const { id } = await params;
  const item = (latest.rss ?? []).find((it) => it.id === id) as
    | LatestRss
    | undefined;
  if (!item) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-14">
        <LatestDetail item={item} />
      </main>
      <Footer />
    </div>
  );
}
