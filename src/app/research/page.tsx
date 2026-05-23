import Link from "next/link";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { SplitReveal } from "@/components/SplitReveal";
import { TrajectoryDiagram } from "@/components/TrajectoryDiagram";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata = {
  title: "Parallax · 视差研究计划 — Field Notes",
  description:
    "在不能做随机化实验的研究对象上，把多个观测视角并联起来，让方法间的差异本身构成证据。人格、会计、医学、教育、统计方法可以共用一套语汇。",
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
                text="Parallax"
                className="mt-7 font-serif text-[clamp(2.75rem,6vw,5rem)] leading-[1.05] tracking-[-0.02em] text-cream"
              />
              <Reveal delay={220}>
                <p className="mt-5 font-serif italic text-[clamp(1.1rem,1.4vw,1.35rem)] text-cream/70">
                  视差研究计划
                </p>
              </Reveal>
              <Reveal delay={340}>
                <p className="mt-10 max-w-2xl font-fluid-lede leading-[1.7] text-cream/85">
                  在不能做随机化实验的研究对象上，把多个观测视角并联起来，让方法间的差异本身构成证据。从单一历史人物到 ICU 危重症患者、从财务面板到班额实验，研究对象在变，方法语汇可以共用。
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
                  Parallax 的一个具体例子：苏轼 65 年话语演化里，从中断时间序列与外部对照两个视角识别出 1094 惠州为最大话语断裂，1080 黄州只是经典叙事高估的节点。
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
              不能做实验的研究对象怎么识别因果
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-7 space-y-5 font-fluid-body leading-[1.85] text-ink">
              <p>
                视差在天文学里是测距的常用工具。从地球轨道两端看同一颗星，恒星相对远处星空有一个微小位移，由这个位移可以反推出它的距离。整套推断不需要把那颗星拽到实验台上做对照，多视角的差异本身就是证据。
              </p>
              <p>
                同样的思路可以移植到不能做随机化实验的研究对象上。单一历史人物的全集语料、ICU 危重症患者的临床记录、上市公司多年的财务面板、Tennessee 班额实验里 6 千名学生的成绩、BCG 疫苗 13 项试验的合并样本，都是研究者不能换一组对象重做的自然实验记录。能换的是观测视角——同一份数据，多套识别方法并联看下去，方法间的差异反过来构成证据。
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
              单数据集 × 多种方法并联 × 累积对比
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-7 space-y-5 font-fluid-body leading-[1.85] text-ink">
              <p>
                每条研究线都有一份统一研究对象 + 多套识别方法并联的工作样本。人格因果学用王阳明、苏轼、曾国藩、顾炎武四位历史人物的全集语料；因果推断方法学用 Connors 等人 1996 年发表的右心导管 5,735 例 ICU 数据；会计实证用 Bao 等人 2020 公开复制包与 Compustat 面板；多层模型实践用 Tennessee STAR 班额实验的三层嵌套面板；Meta 分析实践用 1948–1985 年 13 项 BCG 疫苗对照试验。
              </p>
              <p>
                每种方法各有假设。中断时间序列要求趋势可外推，合成控制依赖平行假设，倾向得分匹配关注共同支撑，AIPW 同时校正结果模型与处理模型，多层模型靠组间方差换样本独立性假设。把假设并联列出，让方法间的差异反过来构成证据——同一份结论在多个识别策略下都站得住，才算可信。每本书的章末都维护一张累积对比表，把每种方法的估计值、识别假设、稳健性边界放在一起读。
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
              五条进行中的研究线
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-x-12 gap-y-14 md:grid-cols-2">
            <Reveal delay={120}>
              <StudyCard
                title="人格因果学"
                subtitle="王阳明、苏轼、曾国藩、顾炎武四案例"
                body="把廷杖、贬谪、创军、易代视作可识别的人格干预点，用中断时间序列、合成控制、断点检测与跨体裁词频对照重建话语演化。每案配一组双外部对照（朱熹／王安石与黄庭坚／李鸿章与左宗棠／王夫之与黄宗羲）作 parallax 的另一个视角。"
                href="/notes/personality-causal"
              />
            </Reveal>
            <Reveal delay={180}>
              <StudyCard
                title="因果推断方法学"
                subtitle="基于右心导管 5,735 例 ICU 数据的九把刀"
                body="同一份高度非随机的临床数据，从回归调整与 G 计算的参数基线，到倾向得分匹配、IPW 与重叠权重，再到 AIPW、DML 与 TMLE 的双重稳健与机器学习增强，最后用因果森林揭示个体化处理效应。第 8 章用 E-value 与 sensemakr 量化结论对未测量混杂的稳健性。"
                href="/notes/causal-inference-methods/causal-inference-book-v2"
              />
            </Reveal>
            <Reveal delay={240}>
              <StudyCard
                title="会计实证方法学"
                subtitle="Bao 2020 复制包与 Compustat 面板上的十种刀法"
                body="舞弊检测从 Beneish M-Score 与 Dechow F-Score 的规则基线，逐步推到 LASSO、随机森林、XGBoost、RUSBoost、表格深度学习、MD&A 文本特征，最后用 SHAP 给方法选择决策树。盈余管理把 DA 度量从 Healy 1985 推到 Roychowdhury 的真实活动盈余管理，累计十种估计的差异。"
                href="/notes/accounting-empirical"
              />
            </Reveal>
            <Reveal delay={300}>
              <StudyCard
                title="统计方法实践"
                subtitle="Tennessee STAR 班额实验与 BCG 疫苗 Meta 分析"
                body="多层模型那本以 6,325 名学生 × 79 所学校的嵌套面板，把模型从 ICC 与空模型一路推到三层结构、随机斜率与跨层交互。Meta 分析那本以 1948–1985 年 13 项 BCG 试验为底，从效应量计算经固定效应、随机效应、异质性诊断、亚组、meta 回归到发表偏倚。"
                href="/notes/statistical-methods"
              />
            </Reveal>
            <Reveal delay={360}>
              <StudyCard
                title="科研工程手记"
                subtitle="用 Claude Code 辅助科研写作的 16 章经验"
                body="把 Claude Code、Skills、MCP、Hooks 等大模型工程能力嵌入科研写作流程的方法笔记。前八章讲文献调研、章节写作、图表、引用、排版；后八章讲 Skills 自建、并行 Agent、Hook 自动化与人机分工边界。每章以真实论文写作流程里遇到的问题作为切片。"
                href="/notes/research-engineering/claude-code-paper-writing"
              />
            </Reveal>
          </div>
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
