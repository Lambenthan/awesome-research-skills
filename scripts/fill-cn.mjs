#!/usr/bin/env node
/**
 * Generate / refresh Chinese 导读 (cn) for items via GitHub Models.
 *
 * Default model: deepseek/deepseek-v4-flash via OpenRouter (pay-as-you-go).
 * Override with: env OR_MODEL=openai/gpt-4o-mini etc.
 * Auth: OPENROUTER_API_KEY env. Paid tier has no RPM cap, so we drop
 *       the explicit pacing that the previous GH Models path needed
 *       to stay under the free 15 RPM ceiling.
 *
 * Modes:
 *   --missing      (default) only items with empty/missing cn
 *   --overwrite    regenerate cn for every item
 *   --keys k1,k2   only specific item keys
 *   --limit N      stop after N successful generations
 *   --dry-run      print prompt + output, don't write to cn-summaries.yml
 *
 * Style rules come from ~/.claude/skills/book-writing-default/SKILL.md and
 * are inlined verbatim into the system prompt. After generation each cn is
 * regex-validated against a red-line list; failures trigger one stricter
 * retry, and a second failure logs and skips that item.
 *
 * Pacing: no client-side throttle. Concurrent calls bounded by main()
 * issuing them one at a time. Total ≈ 134 × ~2s = 4-5 min on first run.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const CN_FILE = path.join(projectRoot, "content", "cn-summaries.yml");
const SKILLS_JSON = path.join(projectRoot, "src/data/generated/skills.json");
const REPOS_JSON = path.join(projectRoot, "src/data/generated/repos.json");
const ARTICLES_JSON = path.join(projectRoot, "src/data/generated/articles.json");

const TOKEN = process.env.OPENROUTER_API_KEY;
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OR_MODEL || "deepseek/deepseek-v4-flash";
// Paid tier has no RPM cap. Keep a tiny gap (200ms) so we don't hammer
// the endpoint during big batches; this is well under any practical limit.
const REQUEST_GAP_MS = 200;

// ─────────────────────────────────────────────────────────────────────────
// Style rules — verbatim port of book-writing-default + a header explaining
// the adapted scope (item summary instead of book chapter).
// ─────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `你是一个严谨的中文学术目录站的编辑。你的任务是为目录页里的每个 item（一个 Claude Code skill、一个 GitHub 开源项目、或一篇研究文章）写一段 80–180 字的中文导读，向研究者读者说明这是什么、解决什么问题、什么场景下用得上。

下面是你必须严格遵守的写作协议（来自用户 ~/.claude/skills/book-writing-default/SKILL.md，一字不落，全部生效）：

# 写任何中文书的默认协议（强制铁律）

每写完一段先逐条 grep 自检；命中任何一条即重写当前段落，不允许"反正读起来还可以"。

## 第一部分：反 AI 文风铁律（违反即重写）

### 红线 1：严禁"不是 A 而是 B"句式及所有变体

包括但不限于：
- "不是 A，而是 B"（标准式）
- "不是 A，是 B"（省略"而"）
- "这不是 X，是 Y"（"这"开头变体）
- "并非 A，而是 B"
- "X 的目的不是 A，而是 B"
- "最常见的失误不是 A，而是 B"

**改法**：直接陈述 B，或拆成两个独立句。

### 红线 2：严禁数字量词引导段落结构

"至少三类""至少两点""六件事""三件事""三个原因""第一类/第二类""第一/第二/第三"反复堆叠等。

**例外**：单次使用的"第一/第二/第三"作为正常段落过渡可以，但不能反复用数字量词组织全节结构。

**改法**：用"其中……而……相比之下……更麻烦的是……另一种情形下……"这类散文过渡词把逻辑接好。

### 红线 3：严禁列表式 itemize / enumerate

正文用散文，不用 bullet point。**唯一例外**：introduction 环境列学习目标可以用 \\item。

### 红线 4：严禁 AI 套话开场

"值得注意的是""不容忽视的是""我们可以看到""不难发现""显然""易得""综上所述""由此可见""值得关注的是""一言以蔽之""用一句话说""用一句话讲清"。

### 红线 5：严禁"这不是 / 这并非 / 这并不是"开头的否定前置

把"这不是 X"那半句删掉，后半句仍然完整 → 说明前半句多余。

**改法**："这不是算法 bug，是正值性违反的直接表现" → "它本质是正值性违反的直接表现"。

### 红线 6：严控破折号

正文一段最多 1 个破折号。需要强调的内容直接用 **加粗**，不要用"XXX——这就是 YYY"结构。

**章节标题里全面禁用破折号引说明短语**。

### 红线 7：严禁渲染性修饰词

"活生生""乍一看别扭""最直白的反例""最常见的翻车方式""读起来吓人""引起警觉""引起研究者头疼""令研究者头疼""惊人的""伟大的"——一律删除。

### 红线 8：严禁戏剧化形容词

"戏剧性的时刻""脆弱处""命运""奇迹""核心本质""灵魂""桥梁""入场券""第一刀"——除非确实在讲学术意义上的核心概念，否则不用。

### 红线 9：严禁散文化隐喻动词

押注 / 押对 / 押错 / 赌 / 保险绳 / 工具箱 / 地图 / 导航 / 弯路 / 账本 / 被告席 / 救命 / 救不回 / 翻车 / 架枪 / 瞄准 / 拽回 / 推回 / 跨越 / 飞跨。

**作者本人内部思考时可以用任何类比帮自己想清楚，但这些类比一律不进入书内文字**。

### 红线 10：严禁中文全角括号做注释

正文中不使用（）做括号注释或英文术语标注。

**改法**：术语首次出现用"X，简称 Y"或"X，英文称 Y"自然融入正文，后续直接用缩写。

例：错"完全随机缺失（MCAR）" → 对"完全随机缺失，简称 MCAR"。

### 红线 11：严禁章节标题的文艺隐喻 / 疑问句 / 口语化副标题

章节标题走"学术严谨 + 直接陈述"路线。

**禁用模式**：
- "X 的奇妙之旅" / "X 的真相" / "X 的两面" / "X 的边界" / "X 的诱惑与陷阱"
- "为什么 X" / "X 是什么" / "X 真的有用吗"
- 副标题里出现"1000 个学生几个生病""吃辣胃疼""抛硬币晃动"这类幼稚化类比
- 冒号后带形容性短语："方差：晃动幅度的度量"
- 修辞性虚词："起点""奇迹""核心""本质""灵魂"——除非真在讲学术核心
- 赌博 / 工具 / 路径隐喻
- 戏剧化形容词
- **口语量词标题**："三句话讲完 X" / "几句话讲清 X" / "三步带你 X" / "X 的三件事" / "一句话说清 X" / "用大白话讲 X" 等"N 句话 / N 件事 / N 步 / 几句话"型口语标题
- **动词口语化**："讲完""讲清""带你""教你""搞懂""玩转""入门""上手"等带商业读物腔的动词
- **概览/速通词**："X 速览" / "X 一文读懂" / "X 极简指南" / "三分钟看懂 X"

**推荐**：术语本身做标题 / 方法名 + 限定语 / 内容并列结构 / 简短陈述句, 保持科研论文目录级别的严谨正式语气。

### 红线 12：每段加粗不超过 3 处，且严禁整句加粗

加粗用于强调单词或短语，不用于强调整句。

### 红线 13：禁止公开仓库的 commit message 暴露 AI 协作

公开 GitHub commit 写得像一气呵成的成稿，**禁加 Co-Authored-By Claude**。

## 第二部分：直白严谨的中线（整体语气定调）

本协议的核心语气在两个极端之间取中间值——**不能散文化、也不能学术官话化**。
读者通常是研究生与青年研究者，需要内容浅显易懂、能读下去；
同时这是严肃的方法学手册、学术教材或工具书，不是科普散文。

**目标语气**：像一位有过实战经验的师兄/师姐对师弟妹直白讲解一种方法。
术语该写出来就写出来，但每一句话都直接指向具体数据 / 具体场景 / 具体问题，
不绕弯、不堆官话、不抒情、不立场鲜明地表态。

### 偏差一：散文化 / 戏剧化

特征模式：
- 用比喻代替直接陈述
- 用工具 / 路径隐喻：保险绳 / 独绳 / 兜底 / 地图 / 导航 / 弯路 / 账本 / 被告席 / 工具箱
- 用赌博 / 命运语言：押注 / 押对 / 押错 / 赌 / 赌注
- 用拟人化动词：盖不住 / 扛着 / 藏在……深处 / 漂移 / 跑 / 抖 / 翻车 / 架枪 / 瞄准 / 拽回
- 用戏剧化形容：脆弱处 / 命运 / 活生生 / 最常见的翻车方式 / 变魔术 / 玄学 / 最大隐患
- 用情感渲染：可能救命 / 引起警觉 / 令研究者头疼 / 惊人的 / 伟大的

**改法**：直接陈述方法做了什么、得到什么结果，把比喻删掉换成事实描述。

### 偏差二：官话学术化

特征模式与改法（左→右）：

| 错（官话化） | 对（直白严谨） |
|:---|:---|
| 存在……差异 | 不一样 / 差距是 X |
| 进行……分析 | 分析 / 做 / 算 |
| 需要建立一套形式化描述……的语言 | 得有一套能写清楚……的语言 |
| 原因在于……存在系统性差异 | 原因是…… |
| 粗差异中混入了非因果成分 | 粗差异里混了混杂成分 |
| 纳入调整集 | 放进模型（两者等价时优先后者） |
| 得以实现 / 得以保障 / 凭借……可以…… | 直接陈述 |
| 本研究表明 / 本文认为 / 相关研究表明 | 数据显示 / 我们发现 / Smith 2018 报告了 |

### 中线写法三栏对照（核心参考）

| 错（散文化） | 错（官话化） | 对（直白严谨） |
|:---|:---|:---|
| Connors 把账本翻开看到的是相反的方向 | Connors 等的研究结果方向与既有认知存在显著相悖 | Connors 的数据呈现的方向相反 |
| AIPW 的两根保险绳，一根断了另一根接住 | AIPW 通过同时建立两个 nuisance 模型实现稳健性 | AIPW 同时建结局模型和处理模型，只要一个对就稳 |
| 倾向得分把多维空间的距离压缩成数轴上的差，是降维的奇迹 | 倾向得分实现了多维协变量空间向一维标量的降维 | 倾向得分把多维特征压成一个 0 到 1 的数字 |
| 没有 DAG 的回归就是没有地图的导航 | 缺少因果图先验时回归系数的因果解释缺乏理论支撑 | 没有 DAG 给出的调整集，回归系数就没有因果解读的依据 |

### "直觉"与"设想"的使用上限

- "直觉" 严格控制频率。允许的用法仅限于元层面，不允许作为内容词反复出现（"几何直觉""临床直觉吻合""建立直觉"）。
  **替代说法**：几何含义 / 方向上的判断 / 与临床预期一致 / 说明这件事 / 把以上计算写成公式
- "设想" 同样控制频率。
  **替代说法**：考虑 / 假设 / 直接给数字例子

### 自检：每段写完默读三个问题

1. 这段话里有没有非本项目数据的类比？有就删。
2. 这段话里有没有押注 / 保险绳 / 地图 / 账本 / 扛着 / 藏在……深处 这类隐喻动词？有就改成直接陈述。
3. 这段话能不能去掉任何一个"直觉" / "设想"而不损失意义？能就去掉。

三条自检都干净，才进入下一段。

## 第三部分：积极规则（必须做的事）

### 规则 A：概念先行

每个新方法、新假设、新估计量必须先把核心定义亮出来，再用散文展开。**不能上来就讲一大堆散文让读者不知道在讨论什么**。

### 规则 B：每个方法都讲"为什么这样设计"

写完结论之后紧接着解释设计逻辑。**全书的灵魂**。
格式不固定——用"这是因为……""背后的道理是……""提出该方法的学者当年面临的困境是……"等方式自然融入，不要千篇一律地写"为什么这样？"。

### 规则 C：雷区讲原理，不只贴标签

雷区必须包含三件事：为什么人们会踩坑、本质失效机制、诊断方法 / 稳健替代。
**禁用 emoji / 图标 / 装饰符号**。

### 规则 D：每个新术语必须掰碎到初高中生水平

四步法（缺一不可）：
1. 生活类比先行——用读者中学就知道的常识场景做比喻（但禁用那些与本数据无关的外部类比）
2. 数字例子接上——具体可操作的数字，让读者在看公式前就有直觉
3. 再讲符号、公式或计算方式
4. 加一句"停下来想一想"或"回到 XX 数据"的呼吸点

### 规则 E：数据故事先行

每章首段必须用散文写"上一章我们走到哪一步、剩下什么问题、本章用什么方法解决"，不能直接进入方法定义。
**禁用**：章首段写"本章讲 X、Y、Z"的清单式预告。

### 规则 F：数字例子在公式之前

每个公式、每个数学符号在正式出现之前，必须先有一个用具体数字讲的例子。

### 规则 G：公式紧跟符号说明行

每个公式后必须紧跟"其中 $X$ 是……，$Y$ 是……"的散文段，把每个符号锚到具体的人或数。
**禁用 itemize 列符号说明**——用散文。

### 规则 H：一段只引入一个新概念

术语不堆叠。如果一段里出现 3 个以上新术语而中间没有数字例子或类比 → 立即拆段。

### 规则 J：图字体规则

- 中文字符：黑体（Heiti TC macOS / WenQuanYi Zen Hei Linux / SimHei Windows）
- 数字 / 英文：Times New Roman

### 规则 L：作者署名与版权

公开产物**不写真名、不写就读大学**。落款用化名（如"Chanw"）或角色描述。

# 适配到导读场景的具体要求

把上述铁律映射到 80–180 字的中文导读：

- **结构**：一段散文，不分行不列表。先点出"这是什么"（一句话定位），再说"做什么"或"什么能力"（1–2 句），必要时加"什么场景用得上"。
- **字数**：80–180 个中文字符。少于 60 字会显得敷衍，多于 220 字超长。
- **英文专名保留**：Anthropic、Claude Code、PDF、MCP、RAG、agent、LLM、prompt、CLI、API、SDK、framework、scikit-learn、Anthropic Research、Anthropic Engineering 等专名照常用英文。版本号、缩写、库名也保留。
- **避免与英文 description 重复**：你看到的英文 description / readme 是参考，不是要翻译。重新组织一段中文，抓最重要的一两个事实，舍弃次要细节。
- **不堆形容词**：禁用"强大的""全方位""革命性的""颠覆性的""核心""灵魂""完整""完美""易于使用""易用""开箱即用""一站式""全场景""全流程""完整工作流""成熟的""成熟库""成熟工具链""主流的""专业的""高效"。
- **不用"特别适合""尤其适合""特别强调""特别针对""特别擅长"**——这种"特别 +"是 AI 写中文最高发的口癖。直接说"适用于 X 场景"或者删掉。
- **不用"涵盖""覆盖""集成""整合""支持"开头堆功能清单**——这种动词后面接 6 个并列名词就成了 "报菜名"。改成自然的两三句叙述。
- **不用"通过 X 实现 Y""借助 X 完成 Y""利用 X 进行 Y"** 这种"动宾倒装"AI 句式。改成"X 做了 Y" 或 "用 X 来 Y"。
- **不报菜名**：不要把 readme 里的 "## Installation"、"## Features" 等小标题直接搬过来。
- **不出现"本 skill / 本工具 / 本项目 / 该项目 / 该 skill 提供 / 实现 / 支持"开头**：这是典型 AI 营销腔。直接用项目名做主语。
- **不出现"用户""开发者""使用者""研究人员"做主语**：直接讲项目做什么。
- **不分点列功能**：哪怕用顿号或逗号串起来，超过 4 个并列就该归并到 1-2 个上位概念。
- **不写"X 阶段"/"X 步流程"/"X 段式"** 这种数字量词包装的步骤词。
- 数字量词整体克制：除非真有意义，避免"两个核心能力""三类典型场景""四大功能"。

# 输出格式

只输出最终的中文导读文本，1 段散文。不要包含 markdown 代码块、不要 "导读：" 之类的前缀、不要解释、不要任何元注释。`;

// Few-shot examples — anchor the style. Pick high-quality samples covering
// all three item types (skill / repo / article).
const FEW_SHOTS = [
  {
    user: `[item 类型：skill]
[名称]：pdf
[来源仓库]：anthropics/skills
[分类]：Anthropic 官方文档
[原英文描述]：Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs.
[正文摘录]：# PDF Processing Guide ... Use pypdf for text and table extraction, ocrmypdf for OCR ...

请按上面的协议写 80–180 字中文导读，只输出导读正文。`,
    assistant: `Anthropic 官方维护的 PDF 处理 skill。覆盖文本与表格抽取、多份 PDF 合并与拆分、页面旋转、加水印、表单填充、加密与解密，以及对扫描件的 OCR。底层调用 pypdf 与 ocrmypdf，适用于论文写作中读取文献、整理审稿意见与处理学校行政表格等场景。`,
  },
  {
    user: `[item 类型：repo]
[名称]：scikit-learn/scikit-learn
[分类]：数据科学基础
[语言]：Python
[topics]：machine-learning, data-science, statistics, python, classification, regression
[原英文描述]：scikit-learn: machine learning in Python
[README 摘录]：scikit-learn is a Python module for machine learning built on top of SciPy ...

请按上面的协议写 80–180 字中文导读，只输出导读正文。`,
    assistant: `Python 机器学习的事实标准库，建立在 NumPy 与 SciPy 之上。提供分类、回归、聚类、降维、模型选择、特征工程的统一 API，覆盖中小规模数据集上的常规建模。与 pandas、matplotlib 配合构成 Python 数据科学的核心栈，几乎所有入门到中级的有监督学习教学都会用到。`,
  },
  {
    user: `[item 类型：article]
[标题]：Building Effective Agents
[来源]：Anthropic Research
[日期]：2025-12-19
[原英文 blurb]：Anthropic 把"agent"拆成 prompt chain / routing / parallelization / orchestrator / evaluator 五种基本结构，并明确说"先试无 agent 的 workflow"。

请按上面的协议写 80–180 字中文导读，只输出导读正文。`,
    assistant: `Anthropic 研究团队 2024 年底发布的 agent 工程实务长文。文章把 agent 系统拆解为 prompt chain、routing、parallelization、orchestrator-workers、evaluator-optimizer 五种基础结构，并提出一条朴素原则：在能用简单 workflow 解决的场景下不引入完整 agent。文中给出每种结构的代价与适用条件，适合作为 agent 工程的入门参考。`,
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Red-line validators — regex against generated cn. Hits trigger retry.
// ─────────────────────────────────────────────────────────────────────────
const RED_LINES = [
  { name: "不是A而是B", re: /不是[^。，；]{1,40}(?:而是|，是)/ },
  { name: "并非而是", re: /并非[^。，；]{1,40}而是/ },
  { name: "这不是/这并非开头", re: /(?:^|[。；])\s*这不是|(?:^|[。；])\s*这并非/ },
  { name: "数字量词清单", re: /(?:至少|有)[一二三四五六七八九十两][类件个种点项条种]/ },
  { name: "X阶段X步式", re: /[一二三四五六七八九十两][阶层段步]/ },
  { name: "数字+功能/能力/场景", re: /[一二三四五六七八九十两](?:大|个|种|类)(?:核心)?(?:功能|能力|场景|模块|特性|优势|步骤|流程)/ },
  { name: "AI套话", re: /值得注意的是|不容忽视|不难发现|综上所述|由此可见|易得|一言以蔽之|用一句话说|我们可以看到/ },
  { name: "营销词", re: /强大的|颠覆性|革命性|全方位|全场景|全流程|一站式|开箱即用|易用|易于使用|核心本质|灵魂|完美|完整工作流|高效/ },
  { name: "成熟/主流形容", re: /成熟(?:的|工具链|库)|主流(?:的|工具|方案)|专业(?:的|工具|方案|级)/ },
  { name: "特别 +", re: /特别(?:适合|强调|针对|擅长|适用|关注)|尤其(?:适合|擅长|适用)/ },
  { name: "动宾倒装AI句", re: /通过[^。，；]{1,30}(?:实现|完成|提供|支持)|借助[^。，；]{1,30}(?:实现|完成)|利用[^。，；]{1,30}(?:进行|完成|实现)/ },
  { name: "渲染词", re: /活生生|翻车|玄学|惊人的|伟大的|乍一看|拽回|架枪/ },
  { name: "戏剧形容", re: /戏剧性|命运|奇迹|脆弱处|入场券|第一刀|桥梁/ },
  { name: "隐喻动词", re: /押注|押对|押错|保险绳|工具箱|账本|被告席|地图|导航|救命/ },
  { name: "口语动词", re: /带你|教你|讲完|讲清|搞懂|玩转|手把手|轻松搞定/ },
  { name: "速通词", re: /速览|一文读懂|极简指南|三分钟看懂/ },
  { name: "AI 营销开头", re: /^本(?:skill|工具|项目|库|框架|文)(?:提供|实现|支持|帮助你|让你)|^该(?:skill|工具|项目|库|框架)(?:提供|实现|支持)/ },
  { name: "全角括号注释", re: /[一-鿿]\s*[（(][A-Za-z][^()）]{0,30}[)）]/ },
];

function validateCn(text) {
  const hits = [];
  for (const { name, re } of RED_LINES) {
    if (re.test(text)) hits.push(name);
  }
  const charCount = [...text.replace(/\s+/g, "")].length;
  if (charCount < 60) hits.push(`too-short(${charCount})`);
  if (charCount > 240) hits.push(`too-long(${charCount})`);
  // Block dashes (中文一段最多 1 个破折号)
  const dashes = (text.match(/——/g) || []).length;
  if (dashes > 1) hits.push(`too-many-dashes(${dashes})`);
  return hits;
}

function stripFences(text) {
  return text
    .replace(/^\s*```[a-z]*\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .replace(/^\s*导读[:：]\s*/i, "")
    .replace(/^\s*中文导读[:：]\s*/i, "")
    .trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callModel(messages, attempt = 0) {
  if (!TOKEN) throw new Error("OPENROUTER_API_KEY env not set");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      // OpenRouter recommends these to attribute usage and improve routing.
      "HTTP-Referer": "https://lambenthan.github.io/field-notes/",
      "X-Title": "Field Notes fill-cn",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 500,
    }),
  });
  if (res.status === 429 || res.status === 503) {
    const wait = Number(res.headers.get("retry-after") || "10");
    console.warn(`  [${res.status}] backoff ${wait}s …`);
    await sleep(wait * 1000);
    if (attempt < 3) return callModel(messages, attempt + 1);
    throw new Error(`gave up after ${res.status} retries`);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 240)}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

function buildItemPrompt(item) {
  const lines = [`[item 类型：${item._type}]`];
  if (item._type === "skill") {
    lines.push(`[名称]：${item.name}`);
    lines.push(`[来源仓库]：${item.repo}`);
    lines.push(`[分类]：${item.category_label}`);
    if (item.description) lines.push(`[原英文描述]：${item.description}`);
    if (item.body) lines.push(`[正文摘录]：${item.body.slice(0, 2000)}`);
  } else if (item._type === "repo") {
    lines.push(`[名称]：${item.fullName}`);
    lines.push(`[分类]：${item.category_label}`);
    if (item.language) lines.push(`[语言]：${item.language}`);
    if (item.topics?.length) lines.push(`[topics]：${item.topics.join(", ")}`);
    if (item.description) lines.push(`[原英文描述]：${item.description}`);
    if (item.readme) lines.push(`[README 摘录]：${item.readme.slice(0, 2000)}`);
  } else {
    lines.push(`[标题]：${item.title}`);
    lines.push(`[来源]：${item.source}`);
    if (item.date) lines.push(`[日期]：${item.date}`);
    if (item.blurb) lines.push(`[原英文 blurb]：${item.blurb}`);
  }
  lines.push("");
  lines.push("请按上面的协议写 80–180 字中文导读，只输出导读正文。");
  return lines.join("\n");
}

async function summarize(item) {
  const messages = [{ role: "system", content: SYSTEM_PROMPT }];
  for (const fs of FEW_SHOTS) {
    messages.push({ role: "user", content: fs.user });
    messages.push({ role: "assistant", content: fs.assistant });
  }
  messages.push({ role: "user", content: buildItemPrompt(item) });

  let cn = stripFences(await callModel(messages));
  let hits = validateCn(cn);
  if (hits.length === 0) return cn;

  console.warn(`  [retry] ${item._key} hits: ${hits.join(", ")}`);
  messages.push({ role: "assistant", content: cn });
  messages.push({
    role: "user",
    content: `上面这段命中了禁用模式：${hits.join("、")}。请严格按协议重写，把命中处全部消掉。只输出最终中文导读，不要解释、不要前缀。`,
  });
  cn = stripFences(await callModel(messages));
  hits = validateCn(cn);
  if (hits.length === 0) return cn;
  console.warn(`  [skip] ${item._key} still hits: ${hits.join(", ")}`);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// Manifest builder — flatten all items into a list with stable keys.
// ─────────────────────────────────────────────────────────────────────────
async function buildManifest() {
  const items = [];
  const skills = JSON.parse(await fs.readFile(SKILLS_JSON, "utf8"));
  for (const cat of skills) {
    for (const it of cat.items) {
      items.push({
        _type: "skill",
        _key: `${cat.id}/${it.itemSlug}`,
        name: it.name,
        repo: it.repo,
        category_label: cat.label,
        description: it.description,
        body: it.body,
        cn: it.cn,
      });
    }
  }
  const repos = JSON.parse(await fs.readFile(REPOS_JSON, "utf8"));
  for (const section of ["ai", "research"]) {
    for (const cat of repos[section]) {
      for (const it of cat.items) {
        if (it.fetchFailed) continue;
        items.push({
          _type: "repo",
          _key: `${cat.id}/${it.itemSlug}`,
          fullName: it.fullName,
          category_label: cat.label,
          language: it.language,
          topics: it.topics,
          description: it.description,
          readme: it.readme,
          cn: it.cn,
        });
      }
    }
  }
  const articles = JSON.parse(await fs.readFile(ARTICLES_JSON, "utf8"));
  for (const cat of articles) {
    for (const it of cat.items) {
      items.push({
        _type: "article",
        _key: `${cat.id}/${it.itemSlug}`,
        title: it.title,
        source: it.source,
        date: it.date,
        blurb: it.blurb,
        cn: it.cn,
      });
    }
  }
  return items;
}

async function loadCnYaml() {
  try {
    const text = await fs.readFile(CN_FILE, "utf8");
    return yaml.load(text) || {};
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw err;
  }
}

async function saveCnYaml(map) {
  const sortedKeys = Object.keys(map).sort();
  const out = [
    "# Curated Chinese intros for each item.",
    "# Maintained by scripts/fill-cn.mjs (GitHub Models → DeepSeek-V3).",
    "# Key format: ${category-slug}/${item-slug}",
    "# To override any entry by hand, edit the value here directly; the next",
    "# fill-cn run will leave hand-edited entries alone unless --overwrite.",
    "",
  ];
  for (const k of sortedKeys) {
    const v = map[k];
    if (!v) continue;
    out.push(`"${k}": |-`);
    for (const line of String(v).split("\n")) out.push(`  ${line}`);
    out.push("");
  }
  await fs.writeFile(CN_FILE, out.join("\n"));
}

function parseArgs(argv) {
  const args = { mode: "missing", limit: Infinity, dry: false, keys: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--overwrite") args.mode = "overwrite";
    else if (a === "--missing") args.mode = "missing";
    else if (a === "--dry-run") args.dry = true;
    else if (a === "--limit") args.limit = Number(argv[++i]);
    else if (a === "--keys") args.keys = argv[++i].split(",").map((s) => s.trim());
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  console.log(`fill-cn: model=${MODEL} mode=${args.mode} limit=${args.limit} dry=${args.dry}`);
  if (!TOKEN) {
    console.error("ERROR: OPENROUTER_API_KEY env not set.");
    process.exit(1);
  }

  const manifest = await buildManifest();
  const existing = await loadCnYaml();
  const out = { ...existing };

  let target = manifest;
  if (args.keys) {
    target = manifest.filter((m) => args.keys.includes(m._key));
  } else if (args.mode === "missing") {
    target = manifest.filter((m) => !out[m._key]);
  }
  console.log(`  total items: ${manifest.length}, target to process: ${target.length}`);

  let done = 0;
  let skipped = 0;
  for (const item of target) {
    if (done >= args.limit) break;
    const t0 = Date.now();
    process.stdout.write(`  [${done + skipped + 1}/${Math.min(args.limit, target.length)}] ${item._key} ... `);
    try {
      const cn = await summarize(item);
      if (cn) {
        if (args.dry) {
          console.log(`\n--- DRY RUN cn for ${item._key} ---\n${cn}\n--- end ---`);
        } else {
          out[item._key] = cn;
          await saveCnYaml(out);
        }
        done += 1;
        const elapsed = Date.now() - t0;
        console.log(`✓ ${[...cn].length}字 (${elapsed}ms)`);
      } else {
        skipped += 1;
        console.log("skipped (validation failed twice)");
      }
    } catch (err) {
      skipped += 1;
      console.log(`error: ${err.message}`);
    }
    // pacing
    const remaining = REQUEST_GAP_MS - (Date.now() - t0);
    if (remaining > 0) await sleep(remaining);
  }

  console.log(`\nfill-cn done: ${done} generated, ${skipped} skipped`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
