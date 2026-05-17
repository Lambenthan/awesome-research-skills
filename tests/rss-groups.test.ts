import { describe, it, expect } from "vitest";
import {
  groupIdOf,
  groupRss,
  getGroupMeta,
  itemsInGroup,
  GROUP_ORDER,
} from "../src/lib/rss-groups";
import type { LatestRss } from "../src/lib/types";

function mkItem(over: Partial<LatestRss> = {}): LatestRss {
  return {
    id: Math.random().toString(36).slice(2, 10),
    source: "test",
    sourceName: "OpenAI",
    title: "x",
    url: "https://example.com/x",
    summary: "",
    category: "大模型",
    score: 5,
    cn: "x".repeat(80),
    publishedAt: "2026-05-01T00:00:00.000Z",
    discoveredAt: "2026-05-01T00:00:00.000Z",
    ...over,
  };
}

describe("groupIdOf", () => {
  it("maps known lab sourceNames to labs", () => {
    expect(groupIdOf("OpenAI")).toBe("labs");
    expect(groupIdOf("Anthropic")).toBe("labs");
    expect(groupIdOf("DeepMind")).toBe("labs");
  });

  it("maps Chinese vendors to cn-vendors", () => {
    expect(groupIdOf("Alibaba Cloud")).toBe("cn-vendors");
    expect(groupIdOf("HuggingFace")).toBe("cn-vendors");
    expect(groupIdOf("Xiaomi")).toBe("cn-vendors");
  });

  it("maps academia sources", () => {
    expect(groupIdOf("arXiv")).toBe("academia");
    expect(groupIdOf("Nature")).toBe("academia");
    expect(groupIdOf("HuggingFace Papers")).toBe("academia");
  });

  it("maps GitHub + Reddit to oss", () => {
    expect(groupIdOf("GitHub")).toBe("oss");
    expect(groupIdOf("r/LocalLLaMA")).toBe("oss");
  });

  it("falls back to oss for unknown sources", () => {
    expect(groupIdOf("UnknownFancyVendor")).toBe("oss");
  });
});

describe("getGroupMeta", () => {
  it("returns labs meta", () => {
    const m = getGroupMeta("labs");
    expect(m?.label).toBe("AI Labs");
  });
  it("returns undefined for unknown group", () => {
    expect(getGroupMeta("nope")).toBeUndefined();
  });
});

describe("groupRss", () => {
  it("buckets items by source group and drops empty buckets", () => {
    const items = [
      mkItem({ sourceName: "OpenAI" }),
      mkItem({ sourceName: "Anthropic" }),
      mkItem({ sourceName: "GitHub" }),
    ];
    const groups = groupRss(items);
    expect(groups.map((g) => g.id)).toEqual(["labs", "oss"]);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].items).toHaveLength(1);
  });

  it("preserves GROUP_ORDER even when all four groups are populated", () => {
    const items = [
      mkItem({ sourceName: "OpenAI" }),
      mkItem({ sourceName: "HuggingFace" }),
      mkItem({ sourceName: "Nature" }),
      mkItem({ sourceName: "GitHub" }),
    ];
    const ids = groupRss(items).map((g) => g.id);
    expect(ids).toEqual(GROUP_ORDER.map((g) => g.id));
  });
});

describe("itemsInGroup", () => {
  it("returns only items whose source maps to the requested group", () => {
    const items = [
      mkItem({ sourceName: "OpenAI" }),
      mkItem({ sourceName: "GitHub" }),
      mkItem({ sourceName: "DeepMind" }),
    ];
    expect(itemsInGroup(items, "labs")).toHaveLength(2);
    expect(itemsInGroup(items, "oss")).toHaveLength(1);
    expect(itemsInGroup(items, "academia")).toHaveLength(0);
  });
});
