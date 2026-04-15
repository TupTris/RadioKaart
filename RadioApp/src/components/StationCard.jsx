import { useState } from "react";

/**
 * StationCard toont één radiostation als klikbaar kaartje in de lijst.
 * Bevat het station-logo (favicon), naam, land, genre-tags, bitrate en klikcount.
 * Bij klikken wordt onPlay aangeroepen, wat het station start in de Player.
 * @param {Object}   station   - Station-object van de Radio Browser API.
 * @param {boolean}  isPlaying - Of dit station momenteel afspeelt (toont animatie).
 * @param {Function} onPlay    - Callback om het station te starten.
 */
export default function StationCard({ station, isPlaying, onPlay }) {
  // Bijhoudt of het favicon-plaatje een laadifout heeft gehad
  const [imgError, setImgError] = useState(false);

  const hasFavicon = station.favicon && !imgError;

  // Splits de kommagescheiden tags op, max 3 stuks tonen
  const tags = station.tags
    ? station.tags.split(",").slice(0, 3).filter(Boolean)
    : [];

  const bitrate = station.bitrate ? `${station.bitrate}kbps` : null;
  const codec   = station.codec || null;

  return (
    <div
      className={`station-card ${isPlaying ? "station-playing" : ""}`}
      onClick={() => onPlay(station)}
    >
      {/* Favicon / logo van het station */}
      <div className="station-favicon">
        {hasFavicon ? (
          <img
            src={station.favicon}
            alt={station.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="station-favicon-placeholder">📻</div>
        )}
        {/* Golvende bars: alleen zichtbaar als het station afspeelt */}
        {isPlaying && (
          <div className="playing-indicator">
            <span /><span /><span />
          </div>
        )}
      </div>

      {/* Tekstuele stationsinformatie */}
      <div className="station-info">
        <div className="station-name">{station.name}</div>
        {station.country && (
          <div className="station-country">{station.country}</div>
        )}
        {/* Meta-badges: genre-tags, bitrate en codec */}
        <div className="station-meta">
          {tags.map(tag => (
            <span key={tag} className="station-tag">{tag.trim()}</span>
          ))}
          {bitrate && <span className="station-bitrate">{bitrate}</span>}
          {codec && <span className="station-codec">{codec}</span>}
        </div>
      </div>

      {/* Klikpopulariteit (afgerond naar 'k' bij >999) */}
      <div className="station-votes">
        <span className="votes-icon">▶</span>
        <span className="votes-count">
          {station.clickcount > 999
            ? `${(station.clickcount / 1000).toFixed(1)}k`
            : station.clickcount || 0}
        </span>
      </div>
    </div>
  );
}
