# Implementation Plan: Quote of the Day

**Branch**: `001-quote-of-the-day` | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-quote-of-the-day/spec.md`

**Planning input**: "Use plain HTML/CSS/JavaScript, no backend; persist favorites in localStorage."

## Summary

A single static page that shows a random quote from a built-in list, replaces it on
"New quote" without back-to-back repeats, and lets the visitor toggle the displayed quote as
a favorite. Favorites are saved as a list of quote IDs in `localStorage` and read defensively,
so corrupted or unavailable storage never breaks the page. Logic lives in small DOM-free
files tested with Node's built-in test runner; one thin file wires that logic to the page.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2020, classic scripts)

**Primary Dependencies**: None at runtime. Node.js 18+ for tests only (built-in `node:test`).

**Storage**: Browser `localStorage`, key `qotd.favorites.v1` (see [storage contract](./contracts/storage-contract.md))

**Testing**: `node --test` with `node:assert/strict`; manual checks in [quickstart.md](./quickstart.md)

**Target Platform**: Current desktop and mobile browsers; must work from `file://` and from a static server

**Project Type**: Static single-page web app (no backend)

**Performance Goals**: Quote visible within 1 second of opening (SC-001); "New quote" updates instantly

**Constraints**: No backend, no build step, no runtime dependencies, works offline, no visible errors when storage fails

**Scale/Scope**: 1 page, ~12 quotes, 1 visitor per browser

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How this plan complies | Status |
|-----------|------------------------|--------|
| I. Readable, Single-Purpose Code | Four JS files with one job each: data, picking, favorites storage, DOM wiring. Only `app.js` touches the DOM. | PASS |
| II. Test-Backed Behavior | Every FR mapped to a test or manual check below; tests name the FR they cover; `node --test` runs everything with no installs. | PASS |
| III. Simplicity Over Cleverness | No frameworks, packages, or build step. Quotes live in `js/quotes.js` only. | PASS |
| IV. Defensive Handling of Stored Data | All storage access goes through `favorites-store.js`, which validates input and catches every storage error. IDs, not positions. | PASS |
| V. Spec Is the Source of Truth | No behavior beyond the spec; the favorites list view stays out of scope as the spec states. | PASS |

**Post-design re-check (after Phase 1)**: PASS. The guarded `module.exports` line in logic
files is the only concession to testing; it adds no runtime behavior in the browser and is
not a dependency.

### Requirement → verification map

| Requirement | Verified by |
|-------------|-------------|
| FR-001 | `tests/quotes.test.js` (≥10 quotes, unique IDs, non-empty fields) |
| FR-002, FR-003 | `tests/quote-picker.test.js` + quickstart steps 1–2 |
| FR-004, FR-005 | `tests/quote-picker.test.js` (never returns current; single-quote list) + quickstart step 3 |
| FR-006, FR-007 | `tests/favorites-store.test.js` (toggle) + quickstart step 4 |
| FR-008, FR-009 | `tests/favorites-store.test.js` (save/load round trip by ID) + quickstart step 5 |
| FR-010 | `tests/favorites-store.test.js` (corrupt JSON, wrong types, throwing storage) + quickstart step 7 |
| FR-011 | Native buttons + `aria-pressed`; quickstart step 8 |

## Project Structure

### Documentation (this feature)

```text
specs/001-quote-of-the-day/
├── plan.md              # This file
├── research.md          # Phase 0 decisions
├── data-model.md        # Phase 1 entities and rules
├── quickstart.md        # Phase 1 run + validation guide
├── contracts/
│   ├── ui-contract.md       # Elements, selectors, states
│   └── storage-contract.md  # localStorage key and format
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
index.html               # Page markup; loads the scripts below with defer
css/
└── styles.css           # Layout, readable typography, responsive down to ~360px
js/
├── quotes.js            # QUOTES: built-in list {id, text, author}
├── quote-picker.js      # pickRandomQuote(quotes, currentId, random)
├── favorites-store.js   # createFavoritesStore(storage, knownIds): isFavorite, toggle, list
└── app.js               # DOM wiring only: render quote, handle buttons
tests/
├── quotes.test.js
├── quote-picker.test.js
└── favorites-store.test.js
```

Script load order in `index.html`: `quotes.js`, `quote-picker.js`, `favorites-store.js`,
`app.js`, all with `defer`. Logic files end with:

```js
if (typeof module !== "undefined") module.exports = { /* public functions */ };
```

so tests can `require` them while the browser ignores the line.

**Structure Decision**: Flat static-site layout at the repository root so that `index.html`
is the first thing a reviewer sees and opens. Logic and DOM code are separated per
Constitution I; tests mirror the logic files one-to-one.

## Complexity Tracking

No constitution violations to justify.
