// Connects the quote logic to the page. All decisions live in the other js/ files;
// this file only reads from and writes to the DOM.
(function () {
  const quoteText = document.getElementById("quote-text");
  const quoteAuthor = document.getElementById("quote-author");
  const favoriteButton = document.getElementById("favorite-toggle");
  const favoriteIcon = document.getElementById("favorite-icon");

  const favorites = createFavoritesStore(
    getLocalStorage(),
    QUOTES.map((quote) => quote.id)
  );

  let currentQuoteId = null;

  // Reading window.localStorage can itself throw (e.g. when site data is blocked).
  function getLocalStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  // The button's name stays "Favorite"; aria-pressed carries the state for assistive
  // technology and the (aria-hidden) star shows it visually.
  function renderFavoriteState() {
    const isFavorite = favorites.isFavorite(currentQuoteId);
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    favoriteIcon.textContent = isFavorite ? "★" : "☆";
  }

  function showQuote(quote) {
    currentQuoteId = quote.id;
    quoteText.textContent = quote.text;
    quoteAuthor.textContent = quote.author;
    renderFavoriteState();
  }

  document.getElementById("new-quote").addEventListener("click", () => {
    showQuote(pickRandomQuote(QUOTES, currentQuoteId));
  });

  favoriteButton.addEventListener("click", () => {
    favorites.toggle(currentQuoteId);
    renderFavoriteState();
  });

  showQuote(pickRandomQuote(QUOTES, null));
})();
