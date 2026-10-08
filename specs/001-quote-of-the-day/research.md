# Research: Quote of the Day

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-08

Planning input: "Use plain HTML/CSS/JavaScript, no backend; persist favorites in localStorage."

## R1. How the page is opened

- **Decision**: The page must work when `index.html` is opened directly from disk
  (`file://`) as well as from any static server. Scripts are loaded as classic
  `<script defer>` tags, not ES modules.
- **Rationale**: SC-001 requires a quote "with no setup". Browsers block
  `<script type="module">` on `file://` pages (the origin is `null`, so the module request
  fails a CORS check), which would show an empty page to anyone who double-clicks the file.
  Classic scripts have no such restriction.
- **Alternatives considered**:
  - ES modules + "run a local server" instruction: cleaner imports, but the page silently
    breaks for the most common way of opening it.
  - A bundler that outputs one classic script: solves the problem but adds a build step and
    a dependency, against Constitution III.

## R2. Testing without a browser or packages

- **Decision**: Use Node's built-in test runner (`node --test`, Node 18+). Logic files end
  with a guarded `module.exports` so the same file runs as a classic script in the browser
  and can be `require`d by tests in Node.
- **Rationale**: Constitution II requires one-command tests with no third-party packages.
  `node:test` and `node:assert` ship with Node. Keeping logic free of DOM access
  (Constitution I) means it can be tested without a browser.
- **Alternatives considered**:
  - Jest/Vitest + jsdom: full DOM testing, but adds dependencies and `npm install`.
  - Browser-only test page: no tooling, but cannot run as a single command.

## R3. Random selection without back-to-back repeats (FR-003, FR-005)

- **Decision**: `pickRandomQuote(quotes, currentId, random)` builds the list of candidates
  excluding `currentId` and picks one uniformly. If the list has one quote, it returns that
  quote. The `random` function is injectable (defaults to `Math.random`).
- **Rationale**: Excluding the current quote before picking guarantees a change on every
  press in constant work, unlike "re-roll until different", which can loop forever on a
  one-quote list (spec edge case). An injectable `random` makes the behavior deterministic
  in tests.
- **Alternatives considered**: shuffled deck (no repeats until all are seen) — stronger than
  the spec asks for; the spec explicitly allows non-consecutive repeats.

## R4. Persisting favorites (FR-008, FR-009, FR-010)

- **Decision**: Store favorites in `localStorage` under the key `qotd.favorites.v1` as a JSON
  array of quote IDs. All storage access goes through a small store module that:
  - catches errors when accessing `localStorage` itself, reading, parsing, and writing;
  - accepts only an array of strings and drops IDs not present in the current quote list;
  - keeps an in-memory copy, so favoriting works for the current visit even if saving fails.
- **Rationale**: Directly required by the planning input and Constitution IV. A versioned key
  allows a future format change without misreading old data. IDs instead of array positions
  satisfy FR-009.
- **Alternatives considered**: `sessionStorage` (does not survive a new visit); cookies (sent
  with requests, size limits, no benefit here); IndexedDB (asynchronous, far more than a list
  of IDs needs).

## R5. Quote identity

- **Decision**: Each quote has a hand-written, kebab-case `id` (e.g. `knuth-premature-optimization`).
- **Rationale**: Stable across reordering and edits to the quote text (FR-009); readable when
  inspecting saved data.
- **Alternatives considered**: array index (breaks on reorder); hash of the text (breaks on
  typo fixes).

## R6. Accessible favorite control (FR-011)

- **Decision**: A single `<button>` with `aria-pressed="true|false"` and a visible label that
  changes between "☆ Favorite" and "★ Favorited". The quote region uses `aria-live="polite"`
  so screen readers announce a new quote.
- **Rationale**: `aria-pressed` is the standard pattern for a toggle button and exposes its
  state to assistive technology. Native buttons are keyboard-operable by default (SC-005).
- **Alternatives considered**: a checkbox styled as a star — works, but a toggle button better
  matches the "single control" wording of FR-006.
