const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Same files, same order as the <script defer> tags in index.html.
const SCRIPTS = ["js/quotes.js", "js/quote-picker.js", "js/favorites-store.js", "js/app.js"];

function createFakeElement(id) {
  const attributes = {};
  const listeners = {};
  return {
    id,
    textContent: "",
    setAttribute(name, value) {
      attributes[name] = String(value);
    },
    getAttribute(name) {
      return name in attributes ? attributes[name] : null;
    },
    addEventListener(type, listener) {
      (listeners[type] = listeners[type] || []).push(listener);
    },
    click() {
      (listeners.click || []).forEach((listener) => listener({ type: "click" }));
    },
  };
}

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

// Loads the page scripts against a minimal DOM. `storage` becomes window.localStorage;
// pass `storageThrows: true` to make reading window.localStorage throw, like a browser
// with site data blocked.
function loadPage({ storage = createFakeStorage(), storageThrows = false } = {}) {
  const elements = {};
  const document = {
    getElementById: (id) => (elements[id] = elements[id] || createFakeElement(id)),
  };
  const window = {};
  Object.defineProperty(window, "localStorage", {
    get() {
      if (storageThrows) throw new Error("SecurityError: access denied");
      return storage;
    },
  });

  const context = vm.createContext({ document, window });
  for (const file of SCRIPTS) {
    const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    vm.runInContext(source, context, { filename: file });
  }

  return {
    storage,
    quoteText: () => elements["quote-text"].textContent,
    quoteAuthor: () => elements["quote-author"].textContent,
    newQuoteButton: elements["new-quote"],
    favoriteButton: elements["favorite-toggle"],
    quotes: vm.runInContext("QUOTES", context),
  };
}

test("FR-002: on load, one quote's text and its author are rendered", () => {
  const page = loadPage();
  const shown = page.quotes.find((quote) => quote.text === page.quoteText());
  assert.ok(shown, "rendered text is not a quote from the list");
  assert.equal(page.quoteAuthor(), shown.author);
});

test("FR-004/FR-005: clicking New quote renders a different quote every time", () => {
  const page = loadPage();
  for (let i = 0; i < 20; i += 1) {
    const before = page.quoteText();
    page.newQuoteButton.click();
    assert.notEqual(page.quoteText(), before, `press ${i + 1} did not change the quote`);
    const shown = page.quotes.find((quote) => quote.text === page.quoteText());
    assert.equal(page.quoteAuthor(), shown.author);
  }
});

test("FR-010: page still works when reading window.localStorage throws", () => {
  const page = loadPage({ storageThrows: true });
  assert.ok(page.quoteText().length > 0);
  page.favoriteButton.click();
  assert.equal(page.favoriteButton.getAttribute("aria-pressed"), "true");
  page.newQuoteButton.click();
  assert.ok(page.quoteText().length > 0);
});
