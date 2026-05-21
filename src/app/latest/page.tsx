import { Footer } from "@/components/Footer";
import { LatestFeed } from "@/components/LatestFeed";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata = {
  title: "Latest · AI 最新动态 — Field Notes",
  description:
    "AI 实验室一手内容按 Research / Paper / Engineering / News / OSS 五个维度归档，每 6 小时刷新一次。",
};

export default function LatestPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      <section className="border-b border-rule">
        <div className="mx-auto max-w-[88rem] px-6 pt-14 pb-12">
          <Breadcrumb
            trail={[{ label: "Home", href: "/" }, { label: "Latest" }]}
          />
          <div className="mt-7 grid grid-cols-12 gap-6">
            <div className="col-span-12 sm:col-span-8">
              <Reveal>
                <p className="eyebrow">Latest · 6 小时刷新</p>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="display display-xl mt-4 text-ink">
                  AI <em>最新动态</em>
                </h1>
              </Reveal>
              <Reveal delay={220}>
                <p className="mt-5 max-w-2xl font-fluid-lede leading-[1.75] text-ink-muted">
                  GitHub Actions cron 每 6 小时调用抓取脚本，写入静态 JSON
                  随构建一起部署。条目按内容形态归到 Research、Paper、
                  Engineering、News、OSS 五栏，每条带厂商与主题双维 chip，
                  Anthropic News / Research / Engineering / claude.com 在
                  厂商维归到同一栏。打分用 deepseek-v4-flash，保留 score ≥ 3
                  的条目；访客直接读取静态文件，不发起任何外部请求。
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[88rem] flex-1 px-6 py-12">
        <LatestFeed />
      </main>

      <Footer />
    </div>
  );
}
