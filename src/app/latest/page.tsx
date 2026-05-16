import { Footer } from "@/components/Footer";
import { LatestFeed } from "@/components/LatestFeed";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata = {
  title: "Latest · AI 新动向 — Field Notes",
  description:
    "实时 AI 新闻与上升中开源项目，HackerNews 与 GitHub Search 直拉。",
};

export default function LatestPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-6 pt-14 pb-12">
          <Breadcrumb
            trail={[{ label: "Home", href: "/" }, { label: "Latest" }]}
          />
          <div className="mt-7 grid grid-cols-12 gap-6">
            <div className="col-span-12 sm:col-span-8">
              <Reveal>
                <p className="eyebrow">Latest · 每 6 小时刷新</p>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="display mt-4 text-[44px] text-ink sm:text-[56px]">
                  AI <em>新动向</em>
                </h1>
              </Reveal>
              <Reveal delay={220}>
                <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-ink-muted">
                  GitHub Actions cron 每 6 小时跑一次抓取脚本，HackerNews 上
                  最近上榜的 AI 故事（多关键词查询 + 标题过滤）与近 60 天活跃
                  的高 star AI 项目（按 5 个 topic 分别查询合并）写入静态 JSON，
                  随构建一起部署。访客读静态文件，不发起任何外部请求。
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <LatestFeed />
      </main>

      <Footer />
    </div>
  );
}
