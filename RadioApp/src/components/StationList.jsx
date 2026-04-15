import StationCard from "./StationCard";

/**
 * StationList rendert de volledige lijst van radiostations.
 * Toont een laadindicator, een foutmelding, een leeg-melding of de stations zelf,
 * afhankelijk van de huidige staat.
 * @param {Array}    stations      - De te tonen stations.
 * @param {boolean}  loading       - Of de stations nog geladen worden.
 * @param {string}   error         - Foutmelding om te tonen (null als geen fout).
 * @param {Object}   currentStation - Het momenteel afspelende station.
 * @param {Function} onPlay        - Callback om een station te starten.
 * @param {string}   countryName   - Naam van het geselecteerde land (voor de teller).
 * @param {string}   searchQuery   - Actieve zoekterm (voor de teller).
 */
export default function StationList({
  stations,
  loading,
  error,
  currentStation,
  onPlay,
  countryName,
  searchQuery,
}) {
  // Toon laadindicator zolang data wordt opgehaald
  if (loading) {
    return (
      <div className="station-list-status">
        <div className="pulse-loader">
          <span /><span /><span /><span /><span />
        </div>
        <p>Stations laden...</p>
      </div>
    );
  }

  // Toon foutmelding als de API-aanroep is mislukt
  if (error) {
    return (
      <div className="station-list-status error">
        <span className="status-icon">⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  // Toon een lege staat met contextuele tekst als er geen stations zijn
  if (!stations || stations.length === 0) {
    return (
      <div className="station-list-status empty">
        <span className="status-icon">📭</span>
        <p>
          {searchQuery
            ? `Geen stations gevonden voor "${searchQuery}"`
            : countryName
            ? `Geen stations gevonden in ${countryName}`
            : "Klik op een land op de kaart of zoek een station"}
        </p>
      </div>
    );
  }

  return (
    <div className="station-list">
      {/* Teller boven de lijst */}
      <div className="station-list-header">
        <span className="station-count">
          {stations.length} station{stations.length !== 1 ? "s" : ""}
          {countryName && !searchQuery && ` in ${countryName}`}
          {searchQuery && ` voor "${searchQuery}"`}
        </span>
      </div>

      {/* Scrollbare lijst van StationCard-componenten */}
      <div className="station-cards">
        {stations.map(station => (
          <StationCard
            key={station.stationuuid}
            station={station}
            isPlaying={currentStation?.stationuuid === station.stationuuid}
            onPlay={onPlay}
          />
        ))}
      </div>
    </div>
  );
}
