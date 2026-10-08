---

description: "Task list for the Quote of the Day feature"
---

# Tasks: Quote of the Day

**Input**: Design documents from `/specs/001-quote-of-the-day/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included. Constitution II (NON-NEGOTIABLE) requires an automated test for every
functional requirement, so test tasks come first in each story and must fail before the
matching implementation task is done.

**Organization**: Tasks are grouped by user story so each story can be built and checked on
its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story the task belongs to (US1, US2, US3)
- Paths are relative to the repository root, per the static-site layout in plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the page skeleton and test location

- [X] T001 Create `index.html` with the elements from contracts/ui-contract.md (`#quote` with `aria-live="polite"`, `<blockquote>` containing `#quote-text`, `#quote-author`, `#new-quote`, `#favorite-toggle` with `aria-pressed="false"`) and `defer` script tags in the order `js/quotes.js`, `js/quote-picker.js`, `js/favorites-store.js`, `js/app.js`
- [X] T002 [P] Create `css/styles.css` with centered, readable layout and button focus styles
- [X] T003 [P] Create `tests/` directory and confirm `node --test` runs from the repository root (Node 18+)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The quote data every story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Write `tests/quotes.test.js` (FR-001): list has at least 10 quotes; every quote has non-empty `id`, `text`, `author`; IDs are unique and kebab-case. Run `node --test` and confirm it fails
- [X] T005 Create `js/quotes.js` exporting `QUOTES` with at least 10 quotes, each `{ id, text, author }`; `id` is "Required. Unique across the list. Kebab-case, never reused for a different quote." (data-model.md). End the file with the guarded `module.exports`. Confirm T004 passes

**Checkpoint**: Quote data ready and verified

---

## Phase 3: User Story 1 - See a random quote (Priority: P1) 🎯 MVP

**Goal**: Opening the page shows one random quote with its author

**Independent Test**: Open `index.html` several times; a full quote and author appear each time and vary between visits

### Tests for User Story 1 ⚠️

> Write these tests FIRST and confirm they FAIL before implementation

- [X] T006 [US1] Write `tests/quote-picker.test.js` cases for FR-002/FR-003: with no current quote, `pickRandomQuote(quotes, null, random)` returns a quote from the list; with an injected `random`, the choice is deterministic; across many calls with `Math.random` more than one quote is returned

### Implementation for User Story 1

- [X] T007 [US1] Implement `pickRandomQuote(quotes, currentId, random = Math.random)` in `js/quote-picker.js` per research.md R3; end with guarded `module.exports`. Confirm T006 passes
- [X] T008 [US1] Implement page-load rendering in `js/app.js`: pick a quote with `pickRandomQuote(QUOTES, null)`, set `#quote-text` and `#quote-author` with `textContent`, remember `currentQuoteId`

**Checkpoint**: MVP — the page shows a random quote

---

## Phase 4: User Story 2 - Get a new quote on demand (Priority: P2)

**Goal**: "New quote" replaces the quote with a different one, without a reload

**Independent Test**: Press "New quote" 20 times; the quote changes every time and the page never reloads

### Tests for User Story 2 ⚠️

- [X] T009 [US2] Add cases to `tests/quote-picker.test.js` for FR-005: over 200 calls, `pickRandomQuote(quotes, currentId)` never returns `currentId` when the list has 2+ quotes; with a one-quote list it returns that quote and does not loop. Confirm they fail if T007 did not already cover exclusion

### Implementation for User Story 2

- [X] T010 [US2] Wire `#new-quote` in `js/app.js` (FR-004): on click, `pickRandomQuote(QUOTES, currentQuoteId)`, re-render quote, update `currentQuoteId`; button is a native `<button type="button">` so no form submit or reload occurs

**Checkpoint**: US1 + US2 work independently of favorites

---

## Phase 5: User Story 3 - Favorite a quote and keep it after reload (Priority: P3)

**Goal**: Toggle the displayed quote as a favorite; the state survives reloads

**Independent Test**: Favorite a quote, reload, bring it back with "New quote", see it still favorited; unfavorite, reload, see it cleared

### Tests for User Story 3 ⚠️

- [X] T011 [US3] Write `tests/favorites-store.test.js` with an in-memory fake `Storage` covering: toggle on/off and `isFavorite` (FR-006, FR-007); toggle saves to key `qotd.favorites.v1` as a JSON array and a new store reads it back (FR-008); favorites follow IDs, not positions, when the quote list is reordered (FR-009)
- [X] T012 [US3] Add defensive cases to `tests/favorites-store.test.js` per contracts/storage-contract.md (FR-010): invalid JSON → no favorites; JSON that is not an array → no favorites; non-string and unknown IDs are dropped; storage whose `getItem`/`setItem` throw → store still toggles in memory and does not throw; `storage` itself `null` → same. Confirm T011–T012 fail

### Implementation for User Story 3

- [X] T013 [US3] Implement `createFavoritesStore(storage, knownIds)` in `js/favorites-store.js` with `isFavorite(id)`, `toggle(id)` (returns new state), and `list()`, following research.md R4 and the storage contract; end with guarded `module.exports`. Confirm T011–T012 pass
- [X] T014 [US3] In `js/app.js`, obtain `localStorage` inside `try/catch` (access can throw), create the store with the IDs from `QUOTES`, and wire `#favorite-toggle`: on click call `toggle(currentQuoteId)`
- [X] T015 [US3] In `js/app.js`, render favorite state on every quote render and every toggle (FR-007, FR-011): `aria-pressed` `"true"`/`"false"` and label `★ Favorited` / `☆ Favorite` per contracts/ui-contract.md

**Checkpoint**: All three user stories work

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T016 [P] Make `css/styles.css` responsive so long quotes wrap and stay readable at ~360px width, and show a visible keyboard focus style on both buttons
- [X] T017 [P] Add `README.md` with what the project is, how to open the page, and how to run tests (link to quickstart.md)
- [X] T018 Run `node --test` and confirm every test passes with none skipped (Constitution Quality Gate 1)
- [X] T019 Run the 9 manual checks in quickstart.md, from `file://` and from a static server, and confirm no console errors (Quality Gates 2–3)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: after Setup; blocks all user stories (they all need `QUOTES`)
- **US1 (Phase 3)**: after Foundational
- **US2 (Phase 4)**: after US1 (reuses `pickRandomQuote` and the render function in `app.js`)
- **US3 (Phase 5)**: after Foundational; `favorites-store.js` and its tests can be built in
  parallel with US1/US2, but T014–T015 edit `app.js` and need US1's render function
- **Polish (Phase 6)**: after all stories

### Within Each Story

- Tests are written and seen failing before implementation
- Logic files before `app.js` wiring
- Story checkpoint verified before moving on

### Parallel Opportunities

- T002 and T003 alongside T001
- T011–T013 (favorites store + tests) alongside Phase 3–4, since they touch different files
- T016 and T017 in parallel

## Parallel Example: User Story 3

```text
# While US1/US2 are in progress on js/app.js and js/quote-picker.js:
Task: "T011 [US3] Write tests/favorites-store.test.js core cases"
Task: "T012 [US3] Add defensive cases to tests/favorites-store.test.js"
Task: "T013 [US3] Implement createFavoritesStore in js/favorites-store.js"
```

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 → Phase 2 → Phase 3
2. Stop and validate: the page shows a random quote from `file://`

### Incremental Delivery

1. Add US2 → validate 20 presses without repeats
2. Add US3 → validate favorites across reloads and with corrupted storage
3. Polish → full test run and quickstart checklist

---

## Phase 7: Convergence

- [X] T020 CRITICAL: Add a dependency-free DOM test harness in `tests/app.test.js` that loads `js/quotes.js`, `js/quote-picker.js`, `js/favorites-store.js` and `js/app.js` into one `node:vm` context with a minimal fake `document`/`window`, so `js/app.js` behavior can be tested per Constitution II (missing)
- [X] T021 CRITICAL: Test that the page renders one quote's text and author on load and that clicking `#new-quote` renders a different quote, in `tests/app.test.js` per FR-002, FR-004 and Constitution II (missing)
- [X] T022 CRITICAL: Test that clicking `#favorite-toggle` flips `aria-pressed` and the visible label, and that the indicator is re-rendered when a new quote is shown, in `tests/app.test.js` per FR-006, FR-007 and Constitution II (missing)
- [X] T023 CRITICAL: Test the favorite control's accessible name and state exposure in `tests/app.test.js` per FR-011 and Constitution II (missing)
- [X] T024 CRITICAL: Test that the page still renders a quote and toggles favorites when reading `window.localStorage` throws, in `tests/app.test.js` per FR-010 and Constitution II (missing)

---

## Phase 8: Convergence

- [X] T025 Change the favorite button in `index.html` to contain `<span id="favorite-icon" aria-hidden="true">☆</span>` followed by the constant text `Favorite` per FR-011 and contracts/ui-contract.md (contradicts)
- [X] T026 Change `renderFavoriteState` in `js/app.js` to update only `aria-pressed` and the `#favorite-icon` glyph (☆/★), never the button's own text, per FR-011 and research R6 (contradicts)

---

## Phase 9: Convergence

- [X] T027 CRITICAL: Rename the storage-key test in `tests/favorites-store.test.js` to reference the requirement it verifies ("FR-008: ...") per Constitution II (partial)
