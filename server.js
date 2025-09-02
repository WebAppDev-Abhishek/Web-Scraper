const path = require("path");
const http = require("http");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const { crawlSiteStream } = require("./scraper/crawler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket"], // prefer ws
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("combined"));
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Throttle scraping endpoint usage (socket entry is still guarded server-side)
const scrapeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/scrape", scrapeLimiter);

// Serve the frontend (put the canvas file as public/index.html)
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// --- Socket.IO: live crawl per-connection ---
io.on("connection", (socket) => {
  // Simple per-connection concurrency guard
  let running = false;
  let abort = null;

  socket.on("start", async (payload) => {
    if (running) return socket.emit("errorMsg", { message: "Job already running." });

    const { url, maxPages = 8, includeTel = true, includeMailto = true } = payload || {};
    if (!url || !/^https?:\/\//i.test(url)) {
      return socket.emit("errorMsg", { message: "Invalid URL." });
    }

    running = true;
    socket.emit("start", { target: url });

    try {
      // crawlSiteStream returns an abort function
      abort = await crawlSiteStream({
        startUrl: url,
        maxPages,
        includeTel,
        includeMailto,
        onPage: (info) => socket.emit("page", info),
        onFound: (found) => socket.emit("found", found),
        onDone: (done) => socket.emit("done", done),
      });
    } catch (e) {
      socket.emit("errorMsg", { message: e?.message || "Crawl failed." });
      running = false;
    }
  });

  socket.on("disconnect", () => {
    if (abort) abort(); // stop any in-flight crawl work
    running = false;
  });
});

// Boot
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Live scraper running on http://localhost:${PORT}`);
});
