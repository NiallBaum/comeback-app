import type { PatchEntry } from "@/types";
import type { GameAdapter } from "../types";
import * as cheerio from "cheerio";

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";


// Build first — poe.ninja gives real ladder data (spec section 4.4/9).
export const poeAdapter: GameAdapter = {
  gameId: "poe",

  async fetchPatchNotes(sinceDate) {
    const listResponse = await fetch("https://www.pathofexile.com/forum/view-forum/patch-notes", {
      headers: { "User-Agent": BROWSER_USER_AGENT },
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
      });
      const threadHtml = await threadResponse.text();
      const $$ = cheerio.load(threadHtml);

      const rawBody = $$("table.forumPostListTable tr").first().find("td.content-container .content").text().trim();

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

  async fetchRecommendedBuilds() {
    throw new Error("not implemented");
  },
};
