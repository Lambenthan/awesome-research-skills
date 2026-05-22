import Link from "next/link";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { SplitReveal } from "@/components/SplitReveal";
import { TrajectoryDiagram } from "@/components/TrajectoryDiagram";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata = {
  title: "Personality Causality · 人格因果学 — Field Notes",
  description:
    "把因果识别的语汇移植到不能做随机化实验的研究对象：单一历史人物的全集语料、长时段日记、一份不可重复的话语数据。",
};

export default function ResearchProgramPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      {/* Dark Glasswing-style hero. cream serif H1 sits on ink background.
          Spans nearly a full viewport on desktop. A research-meaningful
          SVG trajectory sits to the right on lg+, beneath the text on
          smaller widths. */}
      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-[88rem] px-6 pt-20 pb-20 sm:pt-28 sm:pb-28">
          <div className="grid gap-x-12 gap-y-16 lg:grid-cols-[3fr_4fr] lg:items-center">
            <div>
              <Reveal>
                <p className="eyebrow text-cream/60">Research Program</p>
              </Reveal>
              <SplitReveal
                as="h1"
                text="人格因果学"
                className="mt-7 font-serif text-[clamp(2.75rem,6vw,5rem)] leading-[1.05] tracking-[-0.02em] text-cream"
              />
              <Reveal delay={220}>
                <p className="mt-5 font-serif italic text-[clamp(1.1rem,1.4vw,1.35rem)] text-cream/70">
                  Personality Causality
                </p>
              </Reveal>
              <Reveal delay={340}>
                <p className="mt-10 max-w-2xl font-fluid-lede leading-[1.7] text-cream/85">
                  把因果识别的语汇移植到不能做随机化实验的研究对象：单一历史人物的全集语料、长时段日记、一份不可重复的话语数据。研究单位是个体，研究时点是事件，研究证据是文本。
                </p>
              </Reveal>
              <Reveal delay={460}>
                <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
                  <a
                    href="#ongoing"
                    className="eyebrow text-cream transition hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
                  >
                    Ongoing studies <span aria-hidden="true">↓</span>
                  </a>
                  <a
                    href="#method"
                    className="eyebrow text-cream/60 transition hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
                  >
                    Method
                  </a>
                  <a
                    href="#extensions"
                    className="eyebrow text-cream/60 transition hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
                  >
                    Extensions
                  </a>
                  <a
                    href="#appendix"
                    className="eyebrow text-cream/60 transition hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
                  >
                    Appendix
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal delay={400} className="lg:pl-6">
              <figure>
                <TrajectoryDiagram />
                <figcaption className="mt-5 max-w-md font-serif italic text-[13px] leading-[1.7] text-cream/55">
                  苏轼 65 年话语演化轨迹示意。四个标注点是研究里识别出的干预年份，1094 惠州那一段是程序里最大的话语断裂。
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
        {/* Soft ink→cream fade so the section edge isn't a hard cut. */}
        <div className="dark-hero-fade" />
      </section>

      <main className="mx-auto w-full max-w-[88rem] flex-1 px-6 pt-12 pb-24">
        <div className="mb-14">
          <Breadcrumb
            trail={[
              { label: "Home", href: "/" },
              { label: "Research" },
            ]}
          />
        </div>

        {/* Why this topic */}
        <section className="mx-auto max-w-3xl border-t border-rule pt-14">
          <Reveal>
            <p className="eyebrow text-ink-subtle">Introduction</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.15] tracking-[-0.015em] text-ink">
              人格不在传统因果识别的舒适区
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-7 space-y-5 font-fluid-body leading-[1.85] text-ink">
              <p>
                随机分配一段贬谪、一种政治打击、或一次重大丧失给一个人这件事不可能发生，单被试的命运也不重复。传统心理学要么诉诸大样本横截面，要么转向描述性叙事。前者把"个体如何演化"留给平均效应，后者把"演化是否真的发生"留给文学。
              </p>
              <p>
                我借了因果推断与文本计量的语汇来处理另一类对象。单一历史人物的全集语料、长时段日记、一份不可重复的话语数据，都能视为一份自然实验记录。研究单位是个体，研究时点是事件，研究证据是文本。
              </p>
            </div>
          </Reveal>
        </section>

        {/* Method */}
        <section id="method" className="mx-auto max-w-3xl border-t border-rule pt-14 mt-20">
          <Reveal>
            <p className="eyebrow text-ink-subtle">Method</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.15] tracking-[-0.015em] text-ink">
              单数据集 × 多种方法并联演练
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-7 space-y-5 font-fluid-body leading-[1.85] text-ink">
              <p>
                同一段语料先用中断时间序列识别政治事件前后的话语断裂，再用合成控制构造一个反事实的"没有贬谪的他"。断点检测交叉确认时点位置，跨体裁词频对照检查识别是否被文体伪装。
              </p>
              <p>
                每种方法各有假设。中断时间序列要求趋势可外推，合成控制依赖平行假设，断点检测受稳健性边界约束。把假设并联列出，让方法间的差异反过来构成证据——同一份结论在多个识别策略下都站得住，才算可信。章末维护一张累积对比表，把每种方法的估计值、识别假设、稳健性边界放在一起读。
              </p>
            </div>
          </Reveal>
        </section>

        {/* Ongoing studies */}
        <section id="ongoing" className="mx-auto max-w-5xl border-t border-rule pt-14 mt-20">
          <Reveal>
            <p className="eyebrow text-ink-subtle">Ongoing studies</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.15] tracking-[-0.015em] text-ink">
              两份进行中的研究
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-x-12 gap-y-14 md:grid-cols-2">
            <Reveal delay={160}>
              <StudyCard
                title="阳明轨迹"
                subtitle="用因果推断与文本计量重读《传习录》343 条与王阳明全集"
                body="1506 年的廷杖贬谪是可识别的人格干预点。中断时间序列、合成控制、断点检测、跨体裁词频四种方法在同一份语料上并联演练，章末汇总诚实边界与可证伪条件。"
                href="/notes/personality-causal/yangming-trajectory"
              />
            </Reveal>
            <Reveal delay={240}>
              <StudyCard
                title="苏轼轨迹"
                subtitle="用因果推断与文本计量重读东坡 65 年文集"
                body="6,375 篇 203 万字为语料，把 1079 乌台诗案、1094 / 1097 两次外生贬谪作为可识别的人格干预点，王安石与黄庭坚为双外部对照。数据修正了传统叙事：最大话语断裂出现在 1094 惠州，1080 黄州只是经典叙事高估的节点；三教融合的真转折期落在 1086 元祐起复，赤壁前后并未发生这种深层调整。"
                href="/notes/personality-causal/sushi-trajectory"
              />
            </Reveal>
          </div>
        </section>

        {/* Extensions */}
        <section id="extensions" className="mx-auto max-w-3xl border-t border-rule pt-14 mt-20">
          <Reveal>
            <p className="eyebrow text-ink-subtle">Extensions</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.15] tracking-[-0.015em] text-ink">
              同一种逻辑可以走出人文学
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-7 space-y-5 font-fluid-body leading-[1.85] text-ink">
              <p>
                人格因果学是这套范式的起点。同一种"单数据集 × 多种方法并联"的逻辑可以走进会计实证，也可以走进观察性医学。
              </p>
              <p>
                舞弊检测部分以 Bao et al. 2020 复制包为基准样本，从 Beneish M-Score 与 Dechow F-Score 的规则基线起步，逐步引入 LASSO 与随机森林。中段进入 XGBoost 与 RUSBoost 的不平衡数据增强，文本侧叠加 MD&A 特征，末章用 SHAP 给方法选择做归因。盈余管理那本则把 DA 度量从 Healy 1985 推演到 Roychowdhury 的真实活动盈余管理，在 Compustat 面板上累计十种估计的差异。
              </p>
              <p>
                在 Connors 等人 1996 年发表的右心导管观察性数据上，九种因果推断方法在 ICU 死亡结局上并联演练，第 8 章用 E-value 与 sensemakr 量化结论对未测量混杂的稳健性。
              </p>
              <p className="text-ink-muted">
                方法在变，问题不变：让方法间的差异反过来检验结论。
              </p>
            </div>
          </Reveal>
        </section>

        {/* Appendix - book index */}
        <section id="appendix" className="mx-auto max-w-3xl border-t border-rule pt-14 mt-20">
          <Reveal>
            <p className="eyebrow text-ink-subtle">Appendix</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.15] tracking-[-0.015em] text-ink">
              相关书稿
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10 space-y-10">
              <BookGroup label="人格因果学">
                <BookLink
                  title="阳明轨迹"
                  href="/notes/personality-causal/yangming-trajectory"
                />
                <BookLink
                  title="苏轼轨迹"
                  href="/notes/personality-causal/sushi-trajectory"
                />
                <BookLink
                  title="曾国藩轨迹"
                  href="/notes/personality-causal/zengguofan-trajectory"
                />
                <BookLink
                  title="亭林轨迹"
                  href="/notes/personality-causal/guyanwu-trajectory"
                />
              </BookGroup>
              <BookGroup label="会计实证方法">
                <BookLink
                  title="财务舞弊检测实践"
                  href="/notes/accounting-empirical/fraud-detection"
                />
                <BookLink
                  title="盈余管理实践"
                  href="/notes/accounting-empirical/earnings-management"
                />
              </BookGroup>
              <BookGroup label="因果推断方法">
                <BookLink
                  title="因果推断实践"
                  href="/notes/causal-inference-methods/causal-inference-book-v2"
                />
              </BookGroup>
              <BookGroup label="统计方法实践">
                <BookLink
                  title="多层模型实践"
                  href="/notes/statistical-methods/hlm-multilevel-modeling"
                />
                <BookLink
                  title="Meta 分析实践"
                  href="/notes/statistical-methods/meta-analysis-bcg"
                />
              </BookGroup>
              <BookGroup label="研究工程">
                <BookLink
                  title="Claude Code 科研手记"
                  href="/notes/research-engineering/claude-code-paper-writing"
                />
              </BookGroup>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StudyCard({
  title,
  subtitle,
  body,
  href,
}: {
  title: string;
  subtitle: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
    >
      <h3 className="font-serif text-[clamp(1.5rem,2vw,1.875rem)] leading-tight tracking-[-0.012em] text-ink transition group-hover:text-ember">
        {title}
      </h3>
      <p className="mt-2 font-serif italic text-[15px] text-ink-muted">
        {subtitle}
      </p>
      <p className="mt-5 font-fluid-body leading-[1.85] text-ink">
        {body}
      </p>
      <p className="mt-6 eyebrow text-ember opacity-70 transition group-hover:opacity-100">
        阅读全书{" "}
        <span aria-hidden="true" className="link-arrow">
          →
        </span>
      </p>
    </Link>
  );
}

function BookGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow text-ink-subtle">{label}</p>
      <ul className="mt-3 space-y-2.5">{children}</ul>
    </div>
  );
}

function BookLink({ title, href }: { title: string; href: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-baseline gap-2 font-serif text-[17px] text-ink transition hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
      >
        <span>{title}</span>
        <span
          aria-hidden="true"
          className="link-arrow text-ink-subtle transition group-hover:text-ember"
        >
          →
        </span>
      </Link>
    </li>
  );
}
