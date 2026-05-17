import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { LatestGroupView } from "@/components/LatestGroupView";
import { NavBar } from "@/components/NavBar";
import { latest } from "@/lib/data";
import { getGroupMeta, itemsInGroup } from "@/lib/rss-groups";

const GROUP_ID = "labs";

export const metadata = {
  title: "AI Labs · Latest — Field Notes",
  description:
    "OpenAI、Anthropic、DeepMind、Google AI、NVIDIA、Mistral、Meta AI、xAI 的官方公告完整列表。",
};

export default function LabsPage() {
  const meta = getGroupMeta(GROUP_ID);
  if (!meta) notFound();
  const items = itemsInGroup(latest.rss ?? [], GROUP_ID);

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-14">
        <LatestGroupView group={meta} items={items} />
      </main>
      <Footer />
    </div>
  );
}
