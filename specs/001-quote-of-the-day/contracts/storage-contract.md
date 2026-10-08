# Storage Contract: Favorites

| Item    | Value |
|---------|-------|
| Store   | `window.localStorage` |
| Key     | `qotd.favorites.v1` |
| Format  | JSON array of quote ID strings, no duplicates. Example: `["knuth-premature-optimization","dijkstra-simplicity"]` |
| Written | After every favorite toggle (whole array). |
| Read    | Once, on page load. |

## Reading rules

| Stored value | Result |
|--------------|--------|
| Key missing | No favorites. |
| Valid array of known IDs | Those IDs are favorites. |
| Array containing unknown IDs | Unknown IDs are ignored. |
| Array containing non-strings | Non-string entries are ignored. |
| Not valid JSON, or JSON that is not an array | No favorites; the page works normally. |
| `localStorage` access throws | No favorites; favorites work in memory for the current visit. |

## Writing rules

- A write that throws (quota exceeded, storage disabled) is caught and ignored.
- The in-memory favorites stay correct for the current visit regardless of write success.

## Versioning

The `.v1` suffix marks the format version. A future incompatible format uses a new key
instead of reinterpreting the old one.
