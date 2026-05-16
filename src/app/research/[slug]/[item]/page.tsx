import { repos } from "@/lib/data";
import { allItemParams } from "@/lib/sections";
import { repoDetail } from "@/app/ai/[slug]/[item]/page";

export function generateStaticParams() {
  return allItemParams("research");
}

type Params = Promise<{ slug: string; item: string }>;

export default async function ResearchItemPage({
  params,
}: {
  params: Params;
}) {
  const { slug, item } = await params;
  return repoDetail(repos.research, slug, item, "research");
}
