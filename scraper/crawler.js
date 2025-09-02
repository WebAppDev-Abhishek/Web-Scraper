const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

// Basic extraction
function extractContacts(html, { includeTel = true, includeMailto = true } = {}) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
  const phoneRegex = /\+?\d[\d\s().-]{7,}\d/g;

  const emails = new Set(html.match(emailRegex) || []);
  const phones = new Set(html.match(phoneRegex) || []);

  // Optionally include values from explicit links
  try {
    const $ = cheerio.load(html);
    if (includeMailto) {
      $("a[href^='mailto:']").each((_, el) => {
        const v = ($(el).attr("href") || "").replace(/^mailto:/i, "").trim();
        if (v && /@/.test(v)) emails.add(v);
      });
    }
    if (includeTel) {
      $("a[href^='tel:']").each((_, el) => {
        const v = ($(el).attr("href") || "").replace(/^tel:/i, "").trim();
        if (v) phones.add(v);
      });
    }
  } catch {}

  return { emails: [...emails], phones: [...phones] };
}

function normalizeUrlMaybe(u) {
  try {
    return new URL(u).href;
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Streamed crawler:
 *  - Calls onPage({url,status})
 *  - Calls onFound({emails:[], phones:[]}) with NEWLY found values only
 *  - Calls onDone({pagesVisited,totalEmails,totalPhones,target})
 * Returns: () => abort()
 */
async function crawlSiteStream({
  startUrl,
  maxPages = 8,
  includeTel = true,
  includeMailto = true,
  delayMs = 200, // polite delay between pages
  timeoutMs = 15000, // per-request timeout
  onPage = () => {},
  onFound = () => {},
  onDone = () => {},
}) {
  const origin = new URL(startUrl).origin;
  const queue = [{ url: startUrl, depth: 0 }];
  const visited = new Set();
  const allEmails = new Set();
  const allPhones = new Set();
  let aborted = false;

  const controller = new AbortController();

  async function fetchPage(u) {
    try {
      const res = await axios.get(u, {
        timeout: timeoutMs,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; ContactScraperBot/1.0; +https://example.invalid/bot) ",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
        maxRedirects: 3,
      });
      return { status: res.status, html: res.data };
    } catch (e) {
      return { status: e.response?.status || 0, html: "" };
    }
  }

  (async () => {
    while (!aborted && queue.length && visited.size < maxPages) {
      const { url } = queue.shift();
      if (visited.has(url)) continue;
      visited.add(url);

      const { status, html } = await fetchPage(url);
      onPage({ url, status });

      if (status === 200 && html) {
        const $ = cheerio.load(html);

        // Extract and stream NEW contacts
        const { emails, phones } = extractContacts($.html(), { includeTel, includeMailto });

        const newEmails = emails.filter((e) => !allEmails.has(e));
        const newPhones = phones.filter((p) => !allPhones.has(p));
        newEmails.forEach((e) => allEmails.add(e));
        newPhones.forEach((p) => allPhones.add(p));
        if (newEmails.length || newPhones.length) onFound({ emails: newEmails, phones: newPhones });

        // Enqueue internal links
        $("a[href]").each((_, el) => {
          const href = $(el).attr("href");
          if (!href) return;
          try {
            const abs = new URL(href, url).href;
            if (abs.startsWith(origin) && !visited.has(abs) && queue.length < maxPages) {
              queue.push({ url: abs });
            }
          } catch {}
        });
      }

      if (delayMs) await sleep(delayMs);
    }

    onDone({
      target: startUrl,
      pagesVisited: [...visited],
      totalEmails: allEmails.size,
      totalPhones: allPhones.size,
      emails: [...allEmails],
      phones: [...allPhones],
    });
  })();

  return function abort() {
    aborted = true;
    try {
      controller.abort();
    } catch {}
  };
}

module.exports = { crawlSiteStream };
