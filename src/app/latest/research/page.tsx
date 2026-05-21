import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { LatestGroupView } from "@/components/LatestGroupView";
import { NavBar } from "@/components/NavBar";
import { latest } from "@/lib/data";
import { getGroupMeta, itemsInGroup } from "@/lib/rss-groups";

const GROUP_ID = "research";

export const metadata = {
  title: "Research · Latest — Field Notes",
  description:
    "Anthropic Research、research.google 等实验室研究博客的完整列表，覆盖 alignment、interpretability、scaling 等方向。",
};

export default function ResearchPage() {
  const meta = getGroupMeta(GROUP_ID);
  if (!meta) notFound();
  const items = itemsInGroup(latest.rss ?? [], GROUP_ID);

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-6 py-14">
        <LatestGroupView group={meta} items={items} />
      </main>
      <Footer />
    </div>
  );
}
