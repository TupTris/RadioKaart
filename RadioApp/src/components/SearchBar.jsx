import { useState } from "react";

/**
 * SearchBar biedt een zoekveld waarmee de gebruiker op stationsnaam kan zoeken.
 * Bij submit wordt onSearch aangeroepen met de ingevulde zoekterm.
 * Bij leegmaken (kruis-knop of lege submit) wordt onSearch("") aangeroepen,
 * zodat de Home-pagina terugvalt op de top-stations.
 * @param {Function} onSearch    - Callback met de zoekterm als argument.
 * @param {boolean}  isSearching - Geeft aan of er momenteel gezocht wordt (toont "...").
 */
export default function SearchBar({ onSearch, isSearching }) {
  const [query, setQuery] = useState("");

  /**
   * Verwerkt het indienen van het zoekformulier.
   * Voorkomt de standaard pagina-herlaad van HTML forms.
   */
  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  }

  /**
   * Wist het zoekveld en reset de lijst naar de beginstand.
   */
  function handleClear() {
    setQuery("");
    onSearch("");
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Zoek radiostations wereldwijd..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {/* Wis-knop: alleen zichtbaar als er tekst in het veld staat */}
        {query && (
          <button type="button" className="search-clear" onClick={handleClear}>
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        className="search-submit"
        disabled={!query.trim() || isSearching}
      >
        {isSearching ? "..." : "Zoek"}
      </button>
    </form>
  );
}
