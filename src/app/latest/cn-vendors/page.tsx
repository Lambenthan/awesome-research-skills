import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { LatestGroupView } from "@/components/LatestGroupView";
import { NavBar } from "@/components/NavBar";
import { latest } from "@/lib/data";
import { getGroupMeta, itemsInGroup } from "@/lib/rss-groups";

const GROUP_ID = "cn-vendors";

export const metadata = {
  title: "中文厂商 · Latest — Field Notes",
  description:
    "阿里通义、月之暗面、小米、智谱、字节、腾讯等中文厂商的模型与产品发布。",
};

export default function CnVendorsPage() {
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
