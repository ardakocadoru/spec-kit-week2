# Data Model: Quote of the Day

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Quote

A single entry in the built-in list (`js/quotes.js`). Read-only at runtime.

| Field    | Type   | Rules |
|----------|--------|-------|
| `id`     | string | Required. Unique across the list. Kebab-case, never reused for a different quote. |
| `text`   | string | Required, non-empty. Shown in full (no truncation). |
| `author` | string | Required, non-empty. |

**List-level rules**

- The list contains at least 10 quotes (FR-001).
- IDs are unique (verified by a test).

## Favorites

The set of quote IDs the visitor has marked as favorite.

| Aspect      | Rule |
|-------------|------|
| In memory   | A `Set` of quote IDs, owned by the favorites store. |
| Persisted   | `localStorage["qotd.favorites.v1"]` = JSON array of strings, e.g. `["kernighan-debugging"]`. |
| On load     | Value is parsed; anything that is not an array of strings is treated as empty. IDs not present in the current quote list are dropped. |
| On change   | The whole array is written back. A failed write is ignored; the in-memory set stays correct for the current visit. |

**State transitions** (per quote)

```text
not favorite --toggle--> favorite --toggle--> not favorite
```

Each toggle updates the in-memory set first, then attempts to save.

## View State

Not persisted. Exists only while the page is open.

| Field            | Meaning |
|------------------|---------|
| `currentQuoteId` | ID of the quote on screen. Set on page load (random) and on each "New quote". |
