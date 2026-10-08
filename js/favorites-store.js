const STORAGE_KEY = "qotd.favorites.v1";

// Keeps the set of favorite quote IDs in memory and mirrors it to storage.
// Storage is untrusted: anything unreadable is treated as "no favorites", and a failed
// save never stops favorites from working for the current visit.
function createFavoritesStore(storage, knownIds) {
  const known = new Set(knownIds);
  const favorites = new Set(readSavedIds(storage).filter((id) => known.has(id)));

  function save() {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch (error) {
      // Storage is disabled or full; the in-memory set is still correct.
    }
  }

  return {
    isFavorite(id) {
      return favorites.has(id);
    },
    toggle(id) {
      if (favorites.has(id)) {
        favorites.delete(id);
      } else {
        favorites.add(id);
      }
      save();
      return favorites.has(id);
    },
    list() {
      return [...favorites];
    },
  };
}

function readSavedIds(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch (error) {
    return [];
  }
}

if (typeof module !== "undefined") module.exports = { createFavoritesStore, STORAGE_KEY };
