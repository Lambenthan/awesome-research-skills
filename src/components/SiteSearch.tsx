"use client";

import { useEffect, useRef, useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const BUNDLE_PATH = `${BASE_PATH}/pagefind/`;

/**
 * Pagefind search UI mount.
 *
 * Loads pagefind-ui.css + pagefind-ui.js at runtime (these files only
 * exist after `npm run build` runs the postbuild pagefind step against
 * the static export in out/). In dev the assets don't exist, so the
 * component renders an explanatory placeholder.
 */
export function SiteSearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );

  useEffect(() => {
    let canceled = false;

    async function init() {
      // Probe the bundle existence first so we can fail fast in dev.
      try {
        const probe = await fetch(`${BUNDLE_PATH}pagefind-ui.js`, {
          method: "HEAD",
        });
        if (!probe.ok) throw new Error("pagefind bundle not found");
      } catch {
        if (!canceled) setStatus("unavailable");
        return;
      }

      // Inject CSS once.
      if (!document.querySelector("link[data-pagefind-ui]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `${BUNDLE_PATH}pagefind-ui.css`;
        link.setAttribute("data-pagefind-ui", "");
        document.head.appendChild(link);
      }

      // Load the UI script once.
      const existing = document.querySelector(
        "script[data-pagefind-ui]",
      ) as HTMLScriptElement | null;
      const script =
        existing ||
        Object.assign(document.createElement("script"), {
          src: `${BUNDLE_PATH}pagefind-ui.js`,
          async: true,
        });
      if (!existing) {
        script.setAttribute("data-pagefind-ui", "");
        document.body.appendChild(script);
      }

      const mount = () => {
        const w = window as unknown as {
          PagefindUI?: new (opts: Record<string, unknown>) => unknown;
        };
        if (!w.PagefindUI || !containerRef.current) return;
        // Clear any previous instance (HMR safety).
        containerRef.current.innerHTML = "";
        new w.PagefindUI({
          element: containerRef.current,
          bundlePath: BUNDLE_PATH,
          showImages: false,
          excerptLength: 24,
          resetStyles: false,
          translations: {
            placeholder: "搜索全站…",
            clear_search: "清除",
            load_more: "加载更多结果",
            search_label: "搜索",
            filters_label: "筛选",
            zero_results: "没有匹配的结果",
            many_results: "[COUNT] 条匹配",
            one_result: "1 条匹配",
            alt_search: "没有找到 [SEARCH_TERM]，下面是 [DISPLAY_SEARCH_TERM] 的结果",
            search_suggestion: "没有找到匹配，试试搜索:",
            searching: "搜索中…",
          },
        });
        if (!canceled) setStatus("ready");
      };

      if ((window as { PagefindUI?: unknown }).PagefindUI) {
        mount();
      } else {
        script.addEventListener("load", mount, { once: true });
      }
    }

    init();
    return () => {
      canceled = true;
    };
  }, []);

  return (
    <div>
      {status === "loading" && (
        <p className="eyebrow text-ink-subtle">搜索索引加载中…</p>
      )}
      {status === "unavailable" && (
        <div className="border border-dashed border-rule p-6 text-[13.5px] leading-[1.8] text-ink-muted">
          搜索索引尚未生成（开发模式下 pagefind 不会跑）。运行{" "}
          <code className="font-mono text-[12.5px] text-ink">npm run build</code>{" "}
          后才能查询。线上版本会在每次部署后自动重建索引。
        </div>
      )}
      <div ref={containerRef} className="pagefind-host mt-2" />
    </div>
  );
}
