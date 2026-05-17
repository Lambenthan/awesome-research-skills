import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SiteSearch } from "@/components/SiteSearch";

export const metadata = {
  title: "Search · 站内搜索 — Field Notes",
  description: "在 Field Notes 全站搜索：研究纲要章节、Claude Code skill、AI 与科研开源项目、研究长文、每日动态。",
};

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      <section className="border-b border-rule">
        <div className="mx-auto max-w-[88rem] px-6 pt-14 pb-12">
          <Breadcrumb
            trail={[{ label: "Home", href: "/" }, { label: "Search" }]}
          />
          <div className="mt-7 grid grid-cols-12 gap-6">
            <div className="col-span-12 sm:col-span-8">
              <Reveal>
                <p className="eyebrow">Search · 站内搜索</p>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="display mt-4 text-[44px] text-ink sm:text-[56px]">
                  搜索全站内容
                </h1>
              </Reveal>
              <Reveal delay={220}>
                <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-ink-muted">
                  覆盖研究纲要章节正文、Claude Code skill 详情、AI 与科研开源项目描述、研究长文、每日动态深度导读。
                  索引由 pagefind 在 build 时静态生成，访客查询 0 外部请求。
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[88rem] flex-1 px-6 py-12">
        <SiteSearch />
      </main>

      <Footer />
    </div>
  );
}
