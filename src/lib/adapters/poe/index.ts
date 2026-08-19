import type { PatchEntry, BuildRecommendation } from "@/types";
import type { GameAdapter } from "../types";
import * as cheerio from "cheerio";

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// PoE's build recommendations relied on poe.ninja's undocumented, unsupported
// build-search API, which broke once already with zero warning when they
// changed their wire format. Demoted to patch-notes-only (same treatment as
// CS2) rather than keep chasing an API with no stability contract — see
// monetization-strategy notes for the full reasoning. The old decoder/build
// logic is fully removed, not left dormant; it's recoverable from git history
// if PoE build recs are ever revisited.
export const poeAdapter: GameAdapter = {
  gameId: "poe",

  async fetchPatchNotes(sinceDate) {
    const listResponse = await fetch("https://www.pathofexile.com/forum/view-forum/patch-notes", {
      headers: { "User-Agent": BROWSER_USER_AGENT },
      cache: "no-store",
    });
    const listHtml = await listResponse.text();
    const $ = cheerio.load(listHtml);

    const threads: { title: string; url: string; date: string }[] = [];
    $("table#view_forum_table tbody tr").each((_, row) => {
      const link = $(row).find(".thread .thread_title .title a");
      const title = link.text().trim();
      const url = link.attr("href");
      const dateText = $(row).find(".thread .postBy .post_date").text().replace(/^,\s*/, "");

      if (title && url && dateText) {
        threads.push({ title, url, date: dateText });
      }
    });

    const recentThreads = threads.filter((thread) => new Date(thread.date) >= new Date(sinceDate) )

    const patchEntries: PatchEntry[] = []

    for (const thread of recentThreads) {
      const threadResponse = await fetch(`https://www.pathofexile.com${thread.url}`, {
        headers: { "User-Agent": BROWSER_USER_AGENT },
        cache: "no-store",
      });
      const threadHtml = await threadResponse.text();
      const $$ = cheerio.load(threadHtml);

      const contentEl = $$("table.forumPostListTable tr").first().find("td.content-container .content")
      const parts: string[] = []

      contentEl.contents().each((_, node) => {
        if (node.type !== "tag") return


        if (node.tagName === "ul" || node.tagName === "ol") {
          $$(node).find("li").each((__, li) => {
            parts.push(`[*] ${$$(li).text().trim()}`);
          })
        }

        if (node.tagName === "h1" || node.tagName === "h2" || node.tagName === "h3") {
          parts.push(`[ ${$$(node).text().trim()} ]`);
        }

      })

      const rawBody = parts.join("\n").trim();

      patchEntries.push({
        gameId: "poe",
        patchDate: new Date(thread.date).toISOString().split("T")[0],
        rawTitle: thread.title,
        rawBody,
        tags: [],
      });
    }

    return patchEntries;
  },

  async fetchRecommendedBuilds(): Promise<BuildRecommendation[]> {
    return [];
  },
};
