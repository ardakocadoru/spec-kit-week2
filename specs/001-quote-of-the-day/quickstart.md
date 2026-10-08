# Quickstart: Quote of the Day

## Prerequisites

- Any modern browser (Chrome, Firefox, Safari, Edge).
- Node.js 18+ (only for running the automated tests).

## Run the page

Open `index.html` in a browser (double-click it, or drag it into a browser window).
No server, install, or build step is needed.

Optional, to serve it over HTTP instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Run the tests

From the repository root:

```bash
node --test
```

Expected: all tests pass, no tests skipped.

## Manual validation

| # | Steps | Expected | Covers |
|---|-------|----------|--------|
| 1 | Open the page. | One quote and its author are shown. | US1, FR-002 |
| 2 | Reload the page a few times. | The quote is not always the same. | US1, FR-003 |
| 3 | Press **New quote** 20 times. | The quote changes on every press; the page never reloads. | US2, FR-004, FR-005, SC-002 |
| 4 | Press **☆ Favorite**. | The star fills (**★ Favorite**) and the button shows its pressed style immediately. | US3, FR-006, FR-007 |
| 5 | Reload, press **New quote** until the same quote returns. | It still shows **★ Favorite** (pressed). | US3, FR-008 |
| 6 | Press **★ Favorite**, reload, find the quote again. | It shows **☆ Favorite** (not pressed). | US3 |
| 7 | In DevTools console: `localStorage.setItem("qotd.favorites.v1", "{oops")`, then reload. | Page loads and shows a quote; nothing is favorited. | FR-010, SC-004 |
| 8 | Use only **Tab**, **Enter** and **Space**. With VoiceOver/NVDA on, focus the favorite button and toggle it. | Both buttons can be reached and used. The screen reader says "Favorite, toggle button" and then "pressed"/"not pressed"; the name itself never changes. | FR-011, SC-005 |
| 9 | Narrow the window to phone width (~360px). | Long quotes wrap and stay readable. | Edge case: long quotes |

Storage formats and element selectors are defined in [contracts/](./contracts/).
