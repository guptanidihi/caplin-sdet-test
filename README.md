# 📈 caplin-sdet-test

A dynamic **Playwright + TypeScript** automation framework built to test and extract FTSE 100 data from the [London Stock Exchange](https://www.londonstockexchange.com/), as part of an SDET technical challenge.

## 🚀 Features

- ✅ Dynamically fetches **Top 10 FTSE 100 constituents** by highest and lowest percentage change
- ✅ Extracts all constituents with **Market Cap > 7 million**
- ✅ Tabular console output for readability
- ✅ Modular Page Object Model (POM) design
- ✅ Single context execution for faster, sequential tests
- ✅ Fully written in **TypeScript**
- 🔐 Placeholder for historical index analysis

## 🧱 Folder Structure

CAPLIN-SDET-TEST/
├── pages/
│   └── FTSE100Page.ts         # Page Object Model for FTSE table
├── tests/
│   └── ftse100.spec.ts        # Test scenarios
├── helpers/
│   └── CookieHelper.ts        # Accept cookie banner logic
├── playwright.config.ts       # Playwright setup/config
├── package.json
└── README.md

## 📦 Installation

### Prerequisites

- Node.js ≥ 18
- npm (or yarn)

### Steps

```bash
git clone https://github.com/yourusername/caplin-sdet-test.git
cd caplin-sdet-test
npm install
npx playwright install
```

---

## 🔪 Running Tests

```bash
npx playwright test
```

To run a specific test file:

```bash
npx playwright test tests/ftse100.spec.ts
```

View the test report:

```bash
npx playwright show-report
```

---

## 🔪 Test Scenarios Implemented

| Test Case Description                                               | Status          |
| ------------------------------------------------------------------- | --------------- |
| Navigate to London Stock Exchange and go to FTSE 100 table          | ✅               |
| Extract Top 10 constituents by **highest % change**                 | ✅               |
| Extract Top 10 constituents by **lowest % change**                  | ✅               |
| Extract all constituents where **Market Cap > 7 million**           | ✅               |
| Determine **lowest average index value by month over last 3 years** | ⏳ (Placeholder) |

---

## 🛠️ Tech Stack

- [Playwright](https://playwright.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)

---

## 🧠 Design Decisions

- Reuses a single **browser context** across tests for better performance.
- Uses **assertions** to ensure data validity (e.g., `expect(data.length).toBe(10)`).
- Clean separation of test logic and page interactions via **Page Object Model**.
- Uses `console.table()` for clean CLI output of data like:

```bash
📅 Constituents with Market Cap > 7 million:
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
| (index) | Name           | Market Cap (Text) | Market Cap (M) |
|--------|----------------|-------------------|----------------|
|   0    | Barclays PLC   | 8,321.50          |    8321.5      |
|   1    | Unilever       | 9,012.90          |    9012.9      |
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Notes

- No credentials or sensitive information is stored.
- The repo is publicly accessible.
- Tests are configured to run sequentially using shared browser context (`beforeEach()` with `test.describe`).

---

## 👤 Author

Developed by **NIDHI JAIN**\
Project: **CAPLIN-SDET-TEST** | SDET Technical Challenge