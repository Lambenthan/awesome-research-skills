import { describe, it, expect } from "vitest";
import { validateCn, validateTitle } from "../scripts/score-and-tag.mjs";

describe("validateCn (cn 中文导读校验)", () => {
  it("accepts a well-formed paragraph (60-240 chars, no red lines)", () => {
    const cn =
      "Anthropic 发布 Claude Opus 4.7，把复杂任务的可托付门槛降低。模型在长任务里少走神，返回前会自我验证，对应用开发者意味着可以把更长的 agent 工作流交给单一模型。代价是 token 单价高于 Sonnet 系列。";
    expect(validateCn(cn)).toEqual([]);
  });

  it("flags '不是 A 而是 B' pattern (no comma between)", () => {
    // The current regex requires no comma between 不是 and 而是 to stay
    // narrow. Phrasing with a comma slips through — that's a known false
    // negative we accept rather than over-flag legitimate sentences.
    const cn =
      "GPT-5.5 的关键不是参数更大而是 agentic 自主执行能力进入产品级。它能理解复杂目标、规划工具调用、自我检查并推进任务到完成。这条产品线和之前的 GPT 系列定位有明显差异。";
    expect(validateCn(cn)).toContain("不是A而是B");
  });

  it("flags numeric-quantifier list-leading phrasing", () => {
    const cn =
      "Mistral Small 4 至少三类提升：推理速度、多语言能力、JSON 输出稳定性都比上一代更好，欧洲小语种依然是 Mistral 的优势项目，开源许可证 Apache 2.0 商用友好可商用。";
    expect(validateCn(cn)).toContain("数字量词清单");
  });

  it("flags AI cliche '值得注意的是'", () => {
    const cn =
      "DeepMind 发布 Gemini 3 Deep Think 推理模式，模型在回答前进行可见的链式推理。值得注意的是，开启 Deep Think 后延迟从秒级到数十秒甚至分钟级，准确率在数学竞赛题上提升明显。";
    expect(validateCn(cn)).toContain("AI套话");
  });

  it("flags marketing words", () => {
    const cn =
      "Anthropic 发布 Claude Design 设计工具，提供强大的品牌一致性保持能力，全方位覆盖设计师的工作流，把对话式 AI 接入完整工作流。模型用 Opus 4.7，从理解品牌到导出交付一站式完成。";
    const hits = validateCn(cn);
    expect(hits).toContain("营销词");
  });

  it("flags too-short text", () => {
    const cn = "OpenAI 发布 GPT-5.5。新模型 agentic 能力强。";
    expect(validateCn(cn)).toContain(
      `too-short(${[...cn.replace(/\s/g, "")].length})`,
    );
  });
});

describe("validateTitle (cleanedTitle 校验)", () => {
  it("accepts a neutral statement title", () => {
    expect(validateTitle("Anthropic 发布 Claude Opus 4.7")).toEqual([]);
  });

  it("flags colloquial prefix '溜儿'", () => {
    expect(validateTitle("溜儿，Anthropic 刚刚把 Claude Opus 4.7 放出来了")).toContain(
      "口语前缀",
    );
  });

  it("flags dramatic vocabulary like '深夜炸弹'", () => {
    expect(validateTitle("OpenAI 深夜炸弹放出了：GPT-5.5")).toContain("戏剧词");
  });

  it("flags time-of-day colloquialism '昨晚'", () => {
    expect(validateTitle("月之暗面昨晚开源新模型：Kimi K2.6")).toContain(
      "时间口语",
    );
  });

  it("flags empty / too short title", () => {
    expect(validateTitle("")).toContain("empty");
    expect(validateTitle("xx")).toContain("too-short(2)");
  });
});
