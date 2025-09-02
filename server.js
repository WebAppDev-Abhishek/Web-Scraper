// server.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

const app = express();
app.use(express.json());

// Utility: extract emails and phone numbers
function extractContacts(html) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
  const phoneRegex = /\+?\d[\d\s().-]{7,}\d/g;

  const emails = html.match(emailRegex) || [];
  const phones = html.match(phoneRegex) || [];

  return {
    emails: [...new Set(emails)],
    phones: [...new Set(phones)]
  };
}

// Crawl one site (limited depth to avoid infinite loops)
async function crawlSite(startUrl, maxPages = 5) {
  const visited = new Set();
  const queue = [startUrl];
  const results = { emails: new Set(), phones: new Set() };

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const { data } = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(data);

      // Extract contacts
      const contacts = extractContacts($("body").text());
      contacts.emails.forEach(e => results.emails.add(e));
      contacts.phones.forEach(p => results.phones.add(p));

      // Find internal links to crawl
      const baseUrl = new URL(startUrl);
      $("a[href]").each((_, el) => {
        const link = $(el).attr("href");
        if (!link) return;

        try {
          const absUrl = new URL(link, baseUrl).href;
          if (absUrl.startsWith(baseUrl.origin) && !visited.has(absUrl)) {
            queue.push(absUrl);
          }
        } catch (e) {
          // ignore invalid URLs
        }
      });
    } catch (err) {
      console.log(`Failed to fetch ${url}: ${err.message}`);
    }
  }

  return {
    emails: [...results.emails],
    phones: [...results.phones],
    pagesVisited: [...visited]
  };
}

// API route
app.post("/scrape", async (req, res) => {
  const { urls, maxPages } = req.body;
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: "Please provide an array of URLs" });
  }

  const results = {};
  for (const url of urls) {
    results[url] = await crawlSite(url, maxPages || 5);
  }

  res.json(results);
});

app.listen(3000, () => {
  console.log("Scraper server running on http://localhost:3000");
});
