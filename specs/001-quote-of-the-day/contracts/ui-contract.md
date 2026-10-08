# UI Contract: Quote of the Day

The page's user-facing interface. Tests and manual checks rely on these hooks; changing them
is a contract change and requires a plan update.

## Elements

| Element | Selector | Requirements |
|---------|----------|--------------|
| Quote text | `#quote-text` | Inside a `<blockquote>`. Full quote text, no truncation. FR-002 |
| Quote author | `#quote-author` | Author name, rendered after the quote text. FR-002 |
| Quote region | `#quote` | `aria-live="polite"` so a new quote is announced. FR-011 |
| New quote button | `#new-quote` | Native `<button>`, visible label "New quote". FR-004, FR-011 |
| Favorite button | `#favorite-toggle` | Native `<button>` with `aria-pressed`. FR-006, FR-007, FR-011 |

## Favorite button states

| Displayed quote is a favorite | `aria-pressed` | Visible label |
|-------------------------------|----------------|---------------|
| No                            | `"false"`      | `☆ Favorite`  |
| Yes                           | `"true"`       | `★ Favorited` |

The state must be re-rendered every time the displayed quote changes and every time the
button is pressed.

## Behavior

- **Page load**: one random quote is rendered; the favorite button reflects its saved state.
- **New quote**: renders a different quote (when more than one exists) without a reload.
- **Favorite toggle**: flips the state of the displayed quote and saves it.
- **Errors**: storage problems never surface as visible errors or block the controls.
- Text is inserted with `textContent`, never `innerHTML`.
