# 🔎 WebScraper

<img width="1056" height="53" alt="Note" src="https://github.com/user-attachments/assets/bb7ac12b-0f3e-49e1-b7e7-ef88a2ba2bc7" />

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
<img width="1159" height="974" alt="screencapture-localhost-3000-2025-09-02-22_31_13" src="https://github.com/user-attachments/assets/c8c5fa00-751d-4c4c-8573-5ff2b75eb9bc" />
<img width="1159" height="739" alt="screencapture-localhost-3000-2025-09-02-22_34_00" src="https://github.com/user-attachments/assets/4fab427a-03b9-405d-b467-7421f288f809" />
<img width="1090" height="885" alt="Screenshot 2025-09-02 223439" src="https://github.com/user-attachments/assets/5bd84a12-abdb-44ed-8cc1-711665c98938" />


