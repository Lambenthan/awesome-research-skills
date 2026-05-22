import type { MDXProps } from "mdx/types";

/**
 * Registry of chapter-level MDX content for notes that have been ported
 * from LaTeX source. The detail page consults this registry to surface a
 * "在线阅读" outline; the chapter route consults it to load + render.
 *
 * To add a new chapter: write the .mdx file under
 * src/content/notes/{categorySlug}/{itemSlug}/chap-{n}.mdx, then push an
 * entry below with the matching loader.
 */
export type ChapterModule = {
  default: (props: MDXProps) => React.JSX.Element;
};

export type ChapterMeta = {
  categorySlug: string;
  itemSlug: string;
  /** URL slug, e.g. "chapter-0" → /notes/.../chapter-0/ */
  slug: string;
  /** Zero-based chapter index. Used for sort order + display number. */
  num: number;
  /** Display number shown in the UI (often num, sometimes Roman). */
  displayNum: string;
  title: string;
  /** Async loader returning the compiled MDX default export. */
  load: () => Promise<ChapterModule>;
};

const ym = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "personality-causal",
  itemSlug: "yangming-trajectory",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/personality-causal/yangming-trajectory/chap-${n}.mdx`),
});

const sushi = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "personality-causal",
  itemSlug: "sushi-trajectory",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/personality-causal/sushi-trajectory/chap-${n}.mdx`),
});

const fraud = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "accounting-empirical",
  itemSlug: "fraud-detection",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/accounting-empirical/fraud-detection/chap-${n}.mdx`),
});

const em = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "accounting-empirical",
  itemSlug: "earnings-management",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/accounting-empirical/earnings-management/chap-${n}.mdx`),
});

const cib2 = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "causal-inference-methods",
  itemSlug: "causal-inference-book-v2",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/causal-inference-methods/causal-inference-book-v2/chap-${n}.mdx`),
});

const zeng = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "personality-causal",
  itemSlug: "zengguofan-trajectory",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/personality-causal/zengguofan-trajectory/chap-${n}.mdx`),
});

const guyw = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "personality-causal",
  itemSlug: "guyanwu-trajectory",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/personality-causal/guyanwu-trajectory/chap-${n}.mdx`),
});

const hlm = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "statistical-methods",
  itemSlug: "hlm-multilevel-modeling",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/statistical-methods/hlm-multilevel-modeling/chap-${n}.mdx`),
});

const meta = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "statistical-methods",
  itemSlug: "meta-analysis-bcg",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/statistical-methods/meta-analysis-bcg/chap-${n}.mdx`),
});

const cc = (n: number, slug: string, displayNum: string, title: string): ChapterMeta => ({
  categorySlug: "research-engineering",
  itemSlug: "claude-code-paper-writing",
  slug,
  num: n,
  displayNum,
  title,
  load: () =>
    import(`@/content/notes/research-engineering/claude-code-paper-writing/chap-${n}.mdx`),
});

export const CHAPTERS: ChapterMeta[] = [
  // Yangming (人格因果学)
  ym(0, "chapter-0", "0", "阳明生平与心学概览"),
  ym(1, "chapter-1", "1", "1506 廷杖事件与阳明人格重组：基于中断时间序列的因果识别"),
  ym(2, "chapter-2", "2", "概念分布散度：朱熹作为外生历史对照"),
  ym(3, "chapter-3", "3", "断点检测：不预设事件年份的转折点定位"),
  ym(4, "chapter-4", "4", "合成控制：用稳定概念构造致良知诞生的反事实"),
  ym(5, "chapter-5", "5", "跨体裁人格分析：体裁固定效应回归与共线诊断"),
  ym(6, "chapter-6", "6", "方法论附录：六种方法的假设核查与 claim 降级"),
  // Sushi (人格因果学)
  sushi(0, "chapter-0", "0", "东坡生平与北宋政局概览"),
  sushi(1, "chapter-1", "1", "1079 乌台诗案与东坡人格重组：基于中断时间序列的因果识别"),
  sushi(2, "chapter-2", "2", "概念分布散度：王安石与黄庭坚作为双外部历史对照"),
  sushi(3, "chapter-3", "3", "断点检测：让数据自报转折点"),
  sushi(4, "chapter-4", "4", "合成控制：用稳定概念构造黄州转向的反事实"),
  sushi(5, "chapter-5", "5", "跨体裁人格分析：体裁固定效应回归与代笔诊断"),
  sushi(6, "chapter-6", "6", "方法论附录：六种方法的假设核查与 claim 降级"),
  // Fraud Detection (会计实证方法)
  fraud(0, "chapter-0", "0", "前言：同一份数据，十种刀法"),
  fraud(1, "chapter-1", "1", "问题与数据：AAER 与上市公司舞弊检测"),
  fraud(2, "chapter-2", "2", "Beneish M-Score：八变量规则基线"),
  fraud(3, "chapter-3", "3", "F-Score：带学习的逻辑回归"),
  fraud(4, "chapter-4", "4", "LASSO 与 Elastic Net：高维变量的正则化"),
  fraud(5, "chapter-5", "5", "决策树与随机森林：跨入非参数世界"),
  fraud(6, "chapter-6", "6", "XGBoost：Boosting 与 Bagging 的差异"),
  fraud(7, "chapter-7", "7", "RUSBoost：复刻 Bao 2020 JAR 主结果"),
  fraud(8, "chapter-8", "8", "表格深度学习与无监督异常检测"),
  fraud(9, "chapter-9", "9", "MD&A 文本与 Loughran-McDonald 词典"),
  fraud(10, "chapter-10", "10", "SHAP 可解释性与方法选择决策树"),
  // Earnings Management (会计实证方法)
  em(0, "chapter-0", "0", "前言：同一份 Compustat 面板的十种刀法"),
  em(1, "chapter-1", "1", "总应计 TA：度量盈余管理的起点"),
  em(2, "chapter-2", "2", "Healy 1985 与 DeAngelo：最早的 DA 度量"),
  em(3, "chapter-3", "3", "Jones 1991 模型：行业残差识别"),
  em(4, "chapter-4", "4", "Modified Jones (Dechow 1995)：剔除收入操纵"),
  em(5, "chapter-5", "5", "Performance-Matched DA (Kothari 2005)"),
  em(6, "chapter-6", "6", "Dechow-Dichev 2002 应计质量"),
  em(7, "chapter-7", "7", "McNichols 改良与签号 vs 绝对值 DA"),
  em(8, "chapter-8", "8", "Stubben 2010 收入侧 DA"),
  em(9, "chapter-9", "9", "Roychowdhury 2006 真实活动盈余管理"),
  em(10, "chapter-10", "10", "十种方法综合对比与方法选择决策树"),
  // Causal Inference Book v2 (因果推断方法)
  cib2(0, "chapter-0", "0", "前言：同一份数据，九把刀"),
  cib2(1, "chapter-1", "1", "问题与数据：RHC 争议的起点"),
  cib2(2, "chapter-2", "2", "因果结构与识别条件"),
  cib2(3, "chapter-3", "3", "回归调整：因果估计的第一刀"),
  cib2(4, "chapter-4", "4", "G 计算：构造反事实人群"),
  cib2(5, "chapter-5", "5", "倾向得分：匹配、加权与平衡诊断"),
  cib2(6, "chapter-6", "6", "双重稳健估计：AIPW 的两根保险绳"),
  cib2(7, "chapter-7", "7", "机器学习增强：Super Learner、DML 与 TMLE"),
  cib2(8, "chapter-8", "8", "结果稳不稳：敏感性分析与未测量混杂"),
  cib2(9, "chapter-9", "9", "谁获益谁受害：因果森林与处理效应异质性"),
  cib2(10, "chapter-10", "10", "全书汇总：九种方法的终极对比"),
  // ZengGuofan (人格因果学)
  zeng(0, "chapter-0", "0", "曾国藩生平与晚清政局概览"),
  zeng(1, "chapter-1", "1", "1853 创湘军事件与人格军事化重组（中断时间序列）"),
  zeng(2, "chapter-2", "2", "概念分布散度：李鸿章与左宗棠双外部对照"),
  zeng(3, "chapter-3", "3", "断点检测：让数据自报转折点"),
  zeng(4, "chapter-4", "4", "合成控制：用稳定概念构造创湘军反事实"),
  zeng(5, "chapter-5", "5", "跨收信人人格分析：收信人固定效应回归"),
  zeng(6, "chapter-6", "6", "方法论附录：单被试历史人物因果推断的诚实边界"),
  zeng(7, "chapter-7", "7", "日级 ITS 旗舰：日记 5554 日条目重审四个 treatment"),
  // GuYanwu (人格因果学)
  guyw(0, "chapter-0", "0", "顾炎武生平与明清易代背景"),
  guyw(1, "chapter-1", "1", "数据集编年问题：诗集 5 时段切分与日知录无编年"),
  guyw(2, "chapter-2", "2", "1660 北上事件 ITS：易代后 16 年延迟反思"),
  guyw(3, "chapter-3", "3", "跨作者散度：顾 vs 王 vs 黄 易代三遗民对照"),
  guyw(4, "chapter-4", "4", "跨文体画像：日知录 vs 文集 vs 诗集"),
  guyw(5, "chapter-5", "5", "9 主题画像：顾炎武的经世学者底色"),
  guyw(6, "chapter-6", "6", "方法论附录 + 四案例跨被试假说总结"),
  // HLM (统计方法实践)
  hlm(0, "chapter-0", "0", "前言：从单层 OLS 到三层模型的十种刀法"),
  hlm(1, "chapter-1", "1", "问题与数据：Tennessee STAR 班额实验"),
  hlm(2, "chapter-2", "2", "嵌套数据与组内相关 ICC"),
  hlm(3, "chapter-3", "3", "空模型：随机截距与方差分解"),
  hlm(4, "chapter-4", "4", "学生层协变量"),
  hlm(5, "chapter-5", "5", "班级层协变量与处理效应"),
  hlm(6, "chapter-6", "6", "随机斜率"),
  hlm(7, "chapter-7", "7", "跨层交互"),
  hlm(8, "chapter-8", "8", "三层模型"),
  hlm(9, "chapter-9", "9", "模型诊断"),
  hlm(10, "chapter-10", "10", "方法对比与结论"),
  // Meta Analysis (统计方法实践)
  meta(0, "chapter-0", "0", "前言：同一份 BCG 数据的十种估计策略"),
  meta(1, "chapter-1", "1", "问题与数据：BCG 与全球结核"),
  meta(2, "chapter-2", "2", "PRISMA 与系统综述流程"),
  meta(3, "chapter-3", "3", "效应量：从 2x2 表到 log RR"),
  meta(4, "chapter-4", "4", "固定效应模型"),
  meta(5, "chapter-5", "5", "随机效应模型"),
  meta(6, "chapter-6", "6", "异质性诊断"),
  meta(7, "chapter-7", "7", "亚组分析与 meta 回归"),
  meta(8, "chapter-8", "8", "发表偏倚"),
  meta(9, "chapter-9", "9", "敏感性分析"),
  meta(10, "chapter-10", "10", "全书汇总"),
  // Claude Code 科研手记 (研究工程)
  cc(1, "chapter-1", "1", "Claude Code 简介与适用场景"),
  cc(2, "chapter-2", "2", "上下文与记忆机制"),
  cc(3, "chapter-3", "3", "提示词的使用经验"),
  cc(4, "chapter-4", "4", "文献调研与管理"),
  cc(5, "chapter-5", "5", "章节写作"),
  cc(6, "chapter-6", "6", "图表制作"),
  cc(7, "chapter-7", "7", "引用与参考文献"),
  cc(8, "chapter-8", "8", "格式排版与文件管理"),
  cc(9, "chapter-9", "9", "Skills 的安装与自建"),
  cc(10, "chapter-10", "10", "并行 Agent"),
  cc(11, "chapter-11", "11", "Hooks 自动化触发器"),
  cc(12, "chapter-12", "12", "MCP 工具扩展"),
  cc(13, "chapter-13", "13", "科研写作的基本要求"),
  cc(14, "chapter-14", "14", "人机分工的边界"),
  cc(15, "chapter-15", "15", "科研 Skill 的设计纪律"),
  cc(16, "chapter-16", "16", "从一篇论文到长期工作习惯"),
];

export function getChaptersForItem(
  categorySlug: string,
  itemSlug: string,
): ChapterMeta[] {
  return CHAPTERS.filter(
    (c) => c.categorySlug === categorySlug && c.itemSlug === itemSlug,
  ).sort((a, b) => a.num - b.num);
}

export function getChapter(
  categorySlug: string,
  itemSlug: string,
  chapterSlug: string,
): ChapterMeta | null {
  return (
    CHAPTERS.find(
      (c) =>
        c.categorySlug === categorySlug &&
        c.itemSlug === itemSlug &&
        c.slug === chapterSlug,
    ) ?? null
  );
}

export function getAdjacentChapters(chapter: ChapterMeta): {
  prev: ChapterMeta | null;
  next: ChapterMeta | null;
} {
  const peers = getChaptersForItem(chapter.categorySlug, chapter.itemSlug);
  const idx = peers.findIndex((c) => c.slug === chapter.slug);
  return {
    prev: idx > 0 ? peers[idx - 1] : null,
    next: idx >= 0 && idx < peers.length - 1 ? peers[idx + 1] : null,
  };
}
