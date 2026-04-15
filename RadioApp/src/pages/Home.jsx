import { useState, useEffect, useCallback } from "react";
import WorldMap from "../components/WorldMap";
import StationList from "../components/StationList";
import GenreFilter from "../components/GenreFilter";
import SearchBar from "../components/SearchBar";
import {
  getStationsByCountry,
  searchStations,
  getTopStations,
} from "../services/api";

/**
 * Home is de hoofdpagina van de applicatie.
 * Beheert alle staat rondom het laden van stations:
 * - Welk land is geselecteerd (via de kaart)
 * - Welk genre is actief (via de GenreFilter)
 * - Wat de huidige zoekopdracht is (via de SearchBar)
 * Geeft de juiste stations door aan StationList.
 */
export default function Home({ currentStation, onPlay }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryName,     setCountryName]     = useState("");
  const [selectedGenre,   setSelectedGenre]   = useState("");
  const [stations,        setStations]        = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [searchQuery,     setSearchQuery]     = useState("");
  // mode bepaalt welke context actief is: "top", "country" of "search"
  const [mode,            setMode]            = useState("top");

  // Laad de populairste stations zodra de pagina voor het eerst opent
  useEffect(() => {
    loadTopStations();
  }, []);

  /**
   * Haalt de wereldwijd populairste stations op en toont deze als beginscherm.
   */
  async function loadTopStations() {
    setLoading(true);
    setError(null);
    setMode("top");
    setSearchQuery("");
    setSelectedCountry(null);
    try {
      const data = await getTopStations(24);
      setStations(data);
    } catch (err) {
      setError("Kon stations niet laden. Controleer je internetverbinding.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Haalt stations op voor een specifiek land, optioneel gefilterd op genre.
   * Wordt aangeroepen wanneer de gebruiker op een land klikt (via WorldMap)
   * of een snelkeuze-land selecteert.
   * @param {string} code  - ISO 3166-1 alpha-2 landcode, bijv. "NL"
   * @param {string} name  - Leesbare landnaam, bijv. "Netherlands"
   * @param {string} genre - Optionele genre-filter (leeg = alle genres)
   */
  const loadCountryStations = useCallback(async (code, name, genre = selectedGenre) => {
    setLoading(true);
    setError(null);
    setMode("country");
    setSearchQuery("");
    setSelectedCountry(code);
    setCountryName(name);
    try {
      const data = await getStationsByCountry(code, {
        limit: 80,
        tag: genre,
        hidebroken: true,
      });
      setStations(data);
    } catch (err) {
      setError(`Kon stations voor ${name} niet laden.`);
    } finally {
      setLoading(false);
    }
  }, [selectedGenre]);

  /**
   * Voert een zoekopdracht uit op stationsnaam.
   * Een lege query reset de lijst naar de top-stations.
   * @param {string} query - De zoekterm ingevoerd door de gebruiker.
   */
  async function handleSearch(query) {
    if (!query) {
      loadTopStations();
      return;
    }
    setLoading(true);
    setError(null);
    setMode("search");
    setSearchQuery(query);
    setSelectedCountry(null);
    try {
      const data = await searchStations(query, {
        limit: 50,
        tag: selectedGenre,
        hidebroken: true,
      });
      setStations(data);
    } catch (err) {
      setError("Zoekactie mislukt. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Verwerkt een genre-wijziging vanuit de GenreFilter.
   * Past de actieve lijst aan op basis van de huidige mode:
   * - Bij 'country': laad opnieuw met nieuw genre
   * - Bij 'search': zoek opnieuw met nieuw genre
   * - Bij 'top': filter client-side op genre
   * @param {string} genre - De nieuwe genre-ID (leeg = alle genres).
   */
  async function handleGenreChange(genre) {
    setSelectedGenre(genre);
    if (mode === "country" && selectedCountry) {
      await loadCountryStations(selectedCountry, countryName, genre);
    } else if (mode === "search" && searchQuery) {
      setLoading(true);
      try {
        const data = await searchStations(searchQuery, { limit: 50, tag: genre });
        setStations(data);
      } catch {
        setError("Filter mislukt.");
      } finally {
        setLoading(false);
      }
    } else {
      // Top-modus: filter client-side op de opgehaalde top-stations
      setLoading(true);
      try {
        const data = await getTopStations(24);
        const filtered = genre
          ? data.filter(s => s.tags?.toLowerCase().includes(genre))
          : data;
        setStations(filtered.length > 0 ? filtered : data);
      } catch {
        setError("Filter mislukt.");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="home">
      {/* Toolbar: zoekbalk + genre-filter */}
      <div className="toolbar">
        <SearchBar onSearch={handleSearch} isSearching={loading && mode === "search"} />
        <GenreFilter selectedGenre={selectedGenre} onGenreSelect={handleGenreChange} />
      </div>

      {/* Hoofdinhoud: wereldkaart links, stationslijst rechts */}
      <div className="content-grid">
        <div className="map-section">
          <WorldMap
            onCountrySelect={(code, name) => loadCountryStations(code, name)}
            selectedCountry={selectedCountry}
          />
        </div>

        <div className="list-section">
          {/* Titel boven de lijst + terugknop */}
          <div className="list-header">
            <h2 className="list-title">
              {mode === "top"     && "🔥 Populaire stations"}
              {mode === "country" && `📡 ${countryName}`}
              {mode === "search"  && `🔍 Resultaten`}
            </h2>
            {mode !== "top" && (
              <button className="back-btn" onClick={loadTopStations}>
                ← Top stations
              </button>
            )}
          </div>

          <StationList
            stations={stations}
            loading={loading}
            error={error}
            currentStation={currentStation}
            onPlay={onPlay}
            countryName={countryName}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  );
}

// klaar voor codereview