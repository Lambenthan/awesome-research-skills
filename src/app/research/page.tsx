import Link from "next/link";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Reveal } from "@/components/Reveal";
import { SplitReveal } from "@/components/SplitReveal";
import { ParticleScene } from "@/components/ParticleScene";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata = {
  title: "视差 · Parallax — Field Notes",
  description:
    "用最新大模型从不同观测视角去做以前做不了的研究。苏轼作品里的情感变化、长时段日记里的态度漂移、临床记录里的隐性混杂——以前难以触达的维度，现在多视角并联起来可读。",
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
                text="视差"
                className="mt-7 font-serif text-[clamp(2.75rem,6vw,5rem)] leading-[1.05] tracking-[-0.02em] text-cream"
              />
              <Reveal delay={220}>
                <p className="mt-5 font-serif italic text-[clamp(1.1rem,1.4vw,1.35rem)] text-cream/70">
                  Parallax
                </p>
              </Reveal>
              <Reveal delay={340}>
                <p className="mt-10 max-w-2xl font-fluid-lede leading-[1.7] text-cream/85">
                  用最新的大模型从不同观测视角去做以前做不了的研究。苏轼作品里的情感变化、长时段日记里的态度漂移、临床记录里的隐性混杂——以前难以触达的维度，现在多视角并联起来可读。
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
                <div className="relative aspect-[5/3] w-full overflow-hidden">
                  <ParticleScene />
                </div>
                <figcaption className="mt-5 max-w-md font-serif italic text-[13px] leading-[1.7] text-cream/55">
                  Stanford 三维扫描的 Lucy 雕像，10 万颗顶点逐颗绘成发光粒子，相机沿环绕样条漫游。研究里 LLM 给出的逐文档结构化标注，同样是把高维原貌还原成可被各种识别方法读取的密集采样。
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
              用大模型做以前做不了的研究
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-7 space-y-5 font-fluid-body leading-[1.85] text-ink">
              <p>
                视差在天文学里是测距的常用工具。从地球轨道两端看同一颗星，恒星相对远处星空有一个微小位移，由这个位移可以反推出它的距离。整套推断不需要把那颗星拽到实验台上做对照，多视角的差异本身就是证据。
              </p>
              <p>
                这份研究计划关心的不只是因果识别这一块儿，而是怎么把"以前难以触达的维度"用大模型撬开。苏轼八千多篇作品里逐篇的情感强度、忧愤色彩、自省程度，曾国藩三十一年家书里逐封的家庭口吻 vs 军务口吻、教化指令 vs 自责语气，顾炎武未编年文本里逐条的主题归属与时代锚定——这些维度在没有大模型的年代要么靠人工逐篇打标签（不可扩展），要么靠词典法粗略统计（粒度不够），现在可以用 LLM 给出逐文档的结构化标注，再让多种识别方法在这些新维度上并联演练。
              </p>
              <p>
                研究范围由此从历史人物延伸到 ICU 临床记录、上市公司财务面板、班额实验与 Meta 分析合并样本。研究对象在变，方法语汇可以共用：一组结构化标注 + 一份不可重做的真实数据 + 多套识别策略 + 多个外部对照。
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
              大模型作为新一层观测视角
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-7 space-y-5 font-fluid-body leading-[1.85] text-ink">
              <p>
                LLM 进入研究流程不是替换原有计量方法，而是给同一份数据多加一层观测视角。苏轼集 6,375 篇逐篇过一遍大模型，可以拿到八个人格维度评分、九个核心主题归属、跨体裁语气基线；曾国藩家书 1,482 封逐封标注收信人、口吻、教化／军务密度；右心导管 5,735 例的医生 free-text 临床备注转成结构化处理动机变量。这些是以前要么没办法做、要么做完粒度不够的标注层，现在有了，就成了新的因变量与协变量来源。
              </p>
              <p>
                有了这层标注，原本的因果识别方法仍然有效，而且能问出更精细的问题。中断时间序列不再只看词频跳跃，可以看情感强度的 level shift；合成控制可以围绕"自省维度"构造反事实而非围绕表层词袋；多层模型可以把"班级口吻"作为 Level-2 协变量分离它对处理效应的调节。每本书章末维护一张累积对比表，把每种方法的估计值、识别假设、稳健性边界、以及它对 LLM 标注稳健性的依赖一并放在一起读。
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
              五条进行中的研究兴趣
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
