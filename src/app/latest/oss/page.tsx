import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { LatestGroupView } from "@/components/LatestGroupView";
import { NavBar } from "@/components/NavBar";
import { latest } from "@/lib/data";
import { getGroupMeta, itemsInGroup } from "@/lib/rss-groups";

const GROUP_ID = "oss";

export const metadata = {
  title: "开源 OSS · Latest — Field Notes",
  description:
    "GitHub 上的独立开源项目，多为个人或小团队发起的工具与原型。",
};

export default function OssPage() {
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
