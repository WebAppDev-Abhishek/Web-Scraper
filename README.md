# 🔎 WebScraper

A **Node.js + Express + Socket.IO web scraper** that crawls websites (or IP ranges) to extract **emails** and **phone numbers** in real time.  
It comes with a **frontend dashboard** built with HTML, TailwindCSS, and custom JavaScript to display progress, results, and logs.

---

## 📂 Project Structure
```
WebScraper/
│
├─ server.js              # Express + Socket.IO server
├─ scraper/
│   └─ crawler.js         # Core scraper logic
├─ public/
│   ├─ index.html         # Frontend UI
│   ├─ style.css          # Custom styles
│   └─ script.js          # Frontend logic (Socket.IO events)
├─ package.json
└─ README.md
```

---

## ⚡ Features
- ✅ Scrape multiple pages of a website for:
  - 📧 Email addresses
  - 📱 Phone numbers
- ✅ Real-time updates using **Socket.IO**
- ✅ Crawl websites or **IP address ranges**
- ✅ Progress bar + log viewer
- ✅ Clean UI with Tailwind + custom CSS
- ✅ Configurable options:
  - Max pages to crawl
  - Enable/disable email or phone scraping

---

## 🛠️ Installation

Clone the repo:
```bash
git clone https://github.com/your-username/WebScraper.git
cd WebScraper
```

Install dependencies:
```bash
npm install
```

Run the app:
```bash
npm start
```

By default, the server runs on **http://localhost:3000**

---

## 📡 Usage

1. Open **http://localhost:3000** in your browser.
2. Enter a **website URL** or IP address range.
3. Set the number of pages to crawl (default: 10).
4. Choose whether to scrape for:
   - Emails
   - Phone numbers
5. Click **Start Scraping**.
6. Watch results and logs update in **real time**.

---

## 📸 Screenshots
> Example UI when scraping a website:

