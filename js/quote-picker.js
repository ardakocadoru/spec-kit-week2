// Picks a random quote, never the one currently shown (unless it is the only quote).
// Excluding the current quote before picking keeps this a single step, so a one-quote
// list cannot cause an endless re-roll.
function pickRandomQuote(quotes, currentId, random = Math.random) {
  const candidates = quotes.length > 1 ? quotes.filter((quote) => quote.id !== currentId) : quotes;
  const index = Math.floor(random() * candidates.length);
  return candidates[index];
}

if (typeof module !== "undefined") module.exports = { pickRandomQuote };
