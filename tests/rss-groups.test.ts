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
    vendor: "OpenAI",
    contentType: "news",
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
  it("passes through known contentType values", () => {
    expect(groupIdOf("research")).toBe("research");
    expect(groupIdOf("paper")).toBe("paper");
    expect(groupIdOf("engineering")).toBe("engineering");
    expect(groupIdOf("news")).toBe("news");
    expect(groupIdOf("oss")).toBe("oss");
  });

  it("falls back to news for missing contentType", () => {
    expect(groupIdOf(undefined)).toBe("news");
  });
});

describe("getGroupMeta", () => {
  it("returns research meta", () => {
    const m = getGroupMeta("research");
    expect(m?.label).toBe("Research");
  });
  it("returns paper meta", () => {
    const m = getGroupMeta("paper");
    expect(m?.label).toBe("Paper");
  });
  it("returns undefined for unknown group", () => {
    expect(getGroupMeta("nope")).toBeUndefined();
  });
});

describe("groupRss", () => {
  it("buckets items by contentType and drops empty buckets", () => {
    const items = [
      mkItem({ contentType: "news" }),
      mkItem({ contentType: "news" }),
      mkItem({ contentType: "oss" }),
    ];
    const groups = groupRss(items);
    expect(groups.map((g) => g.id)).toEqual(["news", "oss"]);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].items).toHaveLength(1);
  });

  it("preserves GROUP_ORDER even when all five groups are populated", () => {
    const items = [
      mkItem({ contentType: "research" }),
      mkItem({ contentType: "paper" }),
      mkItem({ contentType: "engineering" }),
      mkItem({ contentType: "news" }),
      mkItem({ contentType: "oss" }),
    ];
    const ids = groupRss(items).map((g) => g.id);
    expect(ids).toEqual(GROUP_ORDER.map((g) => g.id));
  });
});

describe("itemsInGroup", () => {
  it("returns only items whose contentType matches the requested group", () => {
    const items = [
      mkItem({ contentType: "news" }),
      mkItem({ contentType: "oss" }),
      mkItem({ contentType: "research" }),
    ];
    expect(itemsInGroup(items, "news")).toHaveLength(1);
    expect(itemsInGroup(items, "oss")).toHaveLength(1);
    expect(itemsInGroup(items, "research")).toHaveLength(1);
    expect(itemsInGroup(items, "paper")).toHaveLength(0);
  });
});
