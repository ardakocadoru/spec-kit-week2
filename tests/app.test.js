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
  let text = "";
  return {
    id,
    textWrites: 0,
    get textContent() {
      return text;
    },
    set textContent(value) {
      text = String(value);
      this.textWrites += 1;
    },
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
    favoriteIcon: () => elements["favorite-icon"] && elements["favorite-icon"].textContent,
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

test("FR-006/FR-007: the favorite toggle flips its state and the indicator follows the quote", () => {
  const page = loadPage();
  const button = page.favoriteButton;
  assert.equal(button.getAttribute("aria-pressed"), "false");
  assert.equal(page.favoriteIcon(), "☆");

  button.click();
  assert.equal(button.getAttribute("aria-pressed"), "true");
  assert.equal(page.favoriteIcon(), "★");
  const favoriteText = page.quoteText();

  page.newQuoteButton.click();
  assert.equal(button.getAttribute("aria-pressed"), "false", "new quote is not a favorite");
  assert.equal(page.favoriteIcon(), "☆");

  for (let i = 0; i < 500 && page.quoteText() !== favoriteText; i += 1) {
    page.newQuoteButton.click();
  }
  assert.equal(page.quoteText(), favoriteText);
  assert.equal(button.getAttribute("aria-pressed"), "true", "favorite shown again is marked");
  assert.equal(page.favoriteIcon(), "★");
});

test("FR-011: the favorite button's accessible name is constant; state is aria-pressed", () => {
  const page = loadPage();
  page.favoriteButton.click();
  page.newQuoteButton.click();
  page.favoriteButton.click();
  assert.equal(page.favoriteButton.textWrites, 0, "app.js must not rewrite the button's name");
});

test("FR-011: index.html gives the favorite button the name \"Favorite\" and hides the icon", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const match = html.match(/<button[^>]*id="favorite-toggle"[^>]*>([\s\S]*?)<\/button>/);
  assert.ok(match, "favorite button not found");
  const [buttonTag, inner] = [match[0], match[1]];

  assert.match(buttonTag, /aria-pressed="false"/);
  assert.match(inner, /<span[^>]*id="favorite-icon"[^>]*aria-hidden="true"[^>]*>/);

  // Accessible name = visible text that is not aria-hidden.
  const name = inner
    .replace(/<span[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
  assert.equal(name, "Favorite");
});
