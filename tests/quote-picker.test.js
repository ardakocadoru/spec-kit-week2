const test = require("node:test");
const assert = require("node:assert/strict");

const { pickRandomQuote } = require("../js/quote-picker.js");

const QUOTES = [
  { id: "a", text: "Quote A", author: "Author A" },
  { id: "b", text: "Quote B", author: "Author B" },
  { id: "c", text: "Quote C", author: "Author C" },
];

test("FR-002: with no current quote, returns a quote from the list", () => {
  const quote = pickRandomQuote(QUOTES, null);
  assert.ok(QUOTES.includes(quote));
});

test("FR-003: the choice is driven by the random source", () => {
  assert.equal(pickRandomQuote(QUOTES, null, () => 0).id, "a");
  assert.equal(pickRandomQuote(QUOTES, null, () => 0.5).id, "b");
  assert.equal(pickRandomQuote(QUOTES, null, () => 0.999).id, "c");
});

test("FR-003: repeated picks return more than one quote", () => {
  const seen = new Set();
  for (let i = 0; i < 200; i += 1) {
    seen.add(pickRandomQuote(QUOTES, null).id);
  }
  assert.ok(seen.size > 1, "random picks always returned the same quote");
});

test("FR-005: never returns the current quote when there are 2+ quotes", () => {
  for (const current of QUOTES) {
    for (let i = 0; i < 200; i += 1) {
      assert.notEqual(pickRandomQuote(QUOTES, current.id).id, current.id);
    }
  }
});

test("FR-005: covers every other quote, even at the edges of the random range", () => {
  assert.equal(pickRandomQuote(QUOTES, "a", () => 0).id, "b");
  assert.equal(pickRandomQuote(QUOTES, "a", () => 0.999).id, "c");
  assert.equal(pickRandomQuote(QUOTES, "c", () => 0.999).id, "b");
});

test("Edge case: a one-quote list returns that quote instead of looping", () => {
  const single = [QUOTES[0]];
  assert.equal(pickRandomQuote(single, "a").id, "a");
  assert.equal(pickRandomQuote(single, null).id, "a");
});
