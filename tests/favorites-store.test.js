const test = require("node:test");
const assert = require("node:assert/strict");

const { createFavoritesStore, STORAGE_KEY } = require("../js/favorites-store.js");

const KNOWN_IDS = ["a", "b", "c"];

// Minimal stand-in for window.localStorage.
function createFakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

function createThrowingStorage() {
  return {
    getItem() {
      throw new Error("SecurityError: storage disabled");
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
  };
}

test("FR-008: favorites are stored under the key from the storage contract", () => {
  assert.equal(STORAGE_KEY, "qotd.favorites.v1");
});

test("FR-006/FR-007: toggle marks and unmarks a quote", () => {
  const store = createFavoritesStore(createFakeStorage(), KNOWN_IDS);
  assert.equal(store.isFavorite("a"), false);
  assert.equal(store.toggle("a"), true);
  assert.equal(store.isFavorite("a"), true);
  assert.equal(store.toggle("a"), false);
  assert.equal(store.isFavorite("a"), false);
});

test("FR-008: favorites are saved as a JSON array and survive a new store (reload)", () => {
  const storage = createFakeStorage();
  const first = createFavoritesStore(storage, KNOWN_IDS);
  first.toggle("a");
  first.toggle("c");

  assert.deepEqual(JSON.parse(storage.data[STORAGE_KEY]), ["a", "c"]);

  const afterReload = createFavoritesStore(storage, KNOWN_IDS);
  assert.equal(afterReload.isFavorite("a"), true);
  assert.equal(afterReload.isFavorite("b"), false);
  assert.equal(afterReload.isFavorite("c"), true);
});

test("FR-008: unfavoriting is also saved", () => {
  const storage = createFakeStorage();
  const first = createFavoritesStore(storage, KNOWN_IDS);
  first.toggle("b");
  first.toggle("b");

  const afterReload = createFavoritesStore(storage, KNOWN_IDS);
  assert.equal(afterReload.isFavorite("b"), false);
  assert.deepEqual(afterReload.list(), []);
});

test("FR-009: favorites follow quote ids, not list positions", () => {
  const storage = createFakeStorage();
  createFavoritesStore(storage, ["a", "b", "c"]).toggle("b");

  const reordered = createFavoritesStore(storage, ["c", "b", "a"]);
  assert.equal(reordered.isFavorite("b"), true);
  assert.equal(reordered.isFavorite("a"), false);
  assert.equal(reordered.isFavorite("c"), false);
});

test("FR-010: invalid JSON is treated as no favorites", () => {
  const store = createFavoritesStore(createFakeStorage({ [STORAGE_KEY]: "{oops" }), KNOWN_IDS);
  assert.deepEqual(store.list(), []);
  assert.equal(store.toggle("a"), true);
});

test("FR-010: JSON that is not an array is treated as no favorites", () => {
  for (const value of ['{"a":true}', '"a"', "42", "null"]) {
    const store = createFavoritesStore(createFakeStorage({ [STORAGE_KEY]: value }), KNOWN_IDS);
    assert.deepEqual(store.list(), [], `stored value ${value}`);
  }
});

test("FR-010 / edge case: non-string and unknown ids are dropped", () => {
  const stored = JSON.stringify(["a", 7, null, { id: "b" }, "removed-quote", "c"]);
  const store = createFavoritesStore(createFakeStorage({ [STORAGE_KEY]: stored }), KNOWN_IDS);
  assert.deepEqual(store.list().sort(), ["a", "c"]);
});

test("FR-010: throwing storage does not break favorites for the current visit", () => {
  const store = createFavoritesStore(createThrowingStorage(), KNOWN_IDS);
  assert.deepEqual(store.list(), []);
  assert.equal(store.toggle("a"), true);
  assert.equal(store.isFavorite("a"), true);
  assert.equal(store.toggle("a"), false);
});

test("FR-010: missing storage (null) still works in memory", () => {
  const store = createFavoritesStore(null, KNOWN_IDS);
  assert.equal(store.toggle("b"), true);
  assert.equal(store.isFavorite("b"), true);
});
