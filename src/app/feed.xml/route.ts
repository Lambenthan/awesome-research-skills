import { CHAPTERS } from "@/lib/chapters";
import { notes } from "@/lib/data";

// Force static generation so this file is emitted as out/feed.xml during
// `next build` under output: "export". Without it, Next would treat the
// route as dynamic and skip it in the static export.
export const dynamic = "force-static";

const SITE_ORIGIN = "https://lambenthan.github.io";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const SITE_URL = SITE_ORIGIN + BASE_PATH;
const SITE_TITLE = "Field Notes · 田野笔记";
const SITE_DESCRIPTION =
  "Chanw 的研究纲要与应用工具书，配套 AI 与科研工具发现面板。";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s: string): string {
  // </ in content closes the CDATA section prematurely; escape just that.
  return "<![CDATA[" + s.replace(/]]>/g, "]]]]><![CDATA[>") + "]]>";
}

function rfc2822(iso: string): string {
  return new Date(iso).toUTCString();
}

type FeedItem = {
  title: string;
  link: string;
  guid: string;
  pubDate: string;
  description: string;
  category?: string;
};

function chapterItems(): FeedItem[] {
  // Resolve note title for each chapter via the notes registry. Items
  // are ordered by (book, chapter num) which is also rough publish order.
  const items: FeedItem[] = [];
  for (const ch of CHAPTERS) {
    const cat = notes.find((c) => c.id === ch.categorySlug);
    const note = cat?.items.find((it) => it.itemSlug === ch.itemSlug);
    if (!cat || !note) continue;
    const link =
      SITE_URL +
      `/notes/${ch.categorySlug}/${ch.itemSlug}/${ch.slug}/`;
    const pub = note.date ? `${note.date}-01T00:00:00.000Z` : null;
    items.push({
      title: `《${note.title}》第 ${ch.displayNum} 章：${ch.title}`,
      link,
      guid: link,
      pubDate: rfc2822(pub || new Date().toISOString()),
      description: note.cn || note.subtitle || "",
      category: cat.label,
    });
  }
  return items;
}

function renderItem(it: FeedItem): string {
  const cat = it.category
    ? `\n      <category>${escape(it.category)}</category>`
    : "";
  return `    <item>
      <title>${escape(it.title)}</title>
      <link>${escape(it.link)}</link>
      <guid isPermaLink="true">${escape(it.guid)}</guid>
      <pubDate>${it.pubDate}</pubDate>
      <description>${cdata(it.description)}</description>${cat}
    </item>`;
}

export async function GET() {
  const items = chapterItems();
  const lastBuild = new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE_TITLE)}</title>
    <link>${escape(SITE_URL)}/</link>
    <description>${escape(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escape(SITE_URL)}/feed.xml" rel="self" type="application/rss+xml"/>
${items.map(renderItem).join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
