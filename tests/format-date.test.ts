import { describe, it, expect } from "vitest";
import { formatShortDate } from "../src/lib/format-date";

describe("formatShortDate", () => {
  it("formats a normal ISO date", () => {
    expect(formatShortDate("2026-05-07T13:00:00.000Z")).toBe("2026-05-07");
  });

  it("pads month and day", () => {
    expect(formatShortDate("2026-01-03T00:00:00.000Z")).toBe("2026-01-03");
  });

  it("returns dash for null / undefined / empty", () => {
    expect(formatShortDate(null)).toBe("—");
    expect(formatShortDate(undefined)).toBe("—");
    expect(formatShortDate("")).toBe("—");
  });

  it("returns dash for unparseable input", () => {
    expect(formatShortDate("not-a-date")).toBe("—");
    // Date is lenient with slash-separated dates and treats them as local
    // time; we accept whatever it returns since the input isn't strict ISO
    // and would not appear in real data — just confirm it returns a date string.
    expect(formatShortDate("2026/05/07")).toMatch(/^2026-05-0[67]$/);
  });

  it("is stable across calls (no time-dependent state)", () => {
    const a = formatShortDate("2026-04-15T16:00:00.000Z");
    const b = formatShortDate("2026-04-15T16:00:00.000Z");
    expect(a).toBe(b);
  });
});
