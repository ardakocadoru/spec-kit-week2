const test = require("node:test");
const assert = require("node:assert/strict");

const { QUOTES } = require("../js/quotes.js");

test("FR-001: the built-in list has at least 10 quotes", () => {
  assert.ok(Array.isArray(QUOTES));
  assert.ok(QUOTES.length >= 10, `expected at least 10 quotes, got ${QUOTES.length}`);
});

test("FR-001: every quote has a non-empty id, text and author", () => {
  for (const quote of QUOTES) {
    for (const field of ["id", "text", "author"]) {
      assert.equal(typeof quote[field], "string", `${quote.id}: ${field} must be a string`);
      assert.ok(quote[field].trim().length > 0, `${quote.id}: ${field} must not be empty`);
    }
  }
});

test("FR-009: quote ids are unique and kebab-case", () => {
  const ids = QUOTES.map((quote) => quote.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate quote id");
  for (const id of ids) {
    assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `"${id}" is not kebab-case`);
  }
});
