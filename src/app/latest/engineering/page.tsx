import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { LatestGroupView } from "@/components/LatestGroupView";
import { NavBar } from "@/components/NavBar";
import { latest } from "@/lib/data";
import { getGroupMeta, itemsInGroup } from "@/lib/rss-groups";

const GROUP_ID = "engineering";

export const metadata = {
  title: "Engineering · Latest — Field Notes",
  description:
    "Anthropic Engineering 与 claude.com/blog 的工程类博客，含 prompt engineering、Computer Use、Claude Code、Skills、MCP 等技术博客与最佳实践。",
};

export default function EngineeringPage() {
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
