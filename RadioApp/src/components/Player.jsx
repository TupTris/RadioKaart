import { useEffect, useRef, useState } from "react";
import { registerClick } from "../services/api";

/**
 * Player is de sticky audiospeler onderaan het scherm.
 * Gebruikt de HTML5 <audio>-API om live radiostreams direct af te spelen.
 * Beheert spelen/pauzeren, volume, mute en foutafhandeling.
 * @param {Object}   station - Het te spelen station-object.
 * @param {Function} onClose - Callback om de player te sluiten (stopt het afspelen).
 */
export default function Player({ station, onClose }) {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [volume,  setVolume]  = useState(0.8);
  const [muted,   setMuted]   = useState(false);

  /**
   * Laadt en speelt een nieuw station af wanneer het station-prop verandert.
   * Registreert ook een klik bij de Radio Browser API voor populariteitsstatistieken.
   */
  useEffect(() => {
    if (!station || !audioRef.current) return;

    setLoading(true);
    setError(false);
    setPlaying(false);

    const audio = audioRef.current;
    // Gebruik de opgeloste URL als die beschikbaar is (betere betrouwbaarheid)
    audio.src = station.url_resolved || station.url;
    audio.load();

    // Meld de klik aan de API zodat de populariteitsscore stijgt
    registerClick(station.stationuuid);

    audio.play()
      .then(() => { setPlaying(true); setLoading(false); })
      .catch(() => { setError(true);  setLoading(false); });

    // Pauzeer bij het opruimen van het effect (bijv. bij stationwisseling)
    return () => { audio.pause(); };
  }, [station?.stationuuid]);

  /**
   * Synchroniseert het HTML5-volume met de volume- en mute-state.
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  /**
   * Wisselt tussen afspelen en pauzeren.
   */
  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      audio.play()
        .then(() => { setPlaying(true); setLoading(false); })
        .catch(() => { setError(true);  setLoading(false); });
    }
  }

  if (!station) return null;

  // Toon max 2 genre-tags in de player-balk
  const tags = station.tags
    ? station.tags.split(",").slice(0, 2).filter(Boolean)
    : [];

  return (
    <div className="player">
      {/* Onzichtbaar HTML5 audio-element — de echte speler */}
      <audio
        ref={audioRef}
        onError={()   => { setError(true);   setLoading(false); setPlaying(false); }}
        onWaiting={()  => setLoading(true)}
        onPlaying={()  => { setLoading(false); setError(false); }}
      />

      {/* Links: stationsinfo (logo + naam + land + tags) */}
      <div className="player-info">
        <div className="player-favicon">
          {station.favicon ? (
            <img src={station.favicon} alt={station.name}
              onError={e => e.target.style.display = "none"} />
          ) : (
            <span>📻</span>
          )}
          {/* Geluidsgolf-animatie: zichtbaar wanneer het station speelt */}
          {playing && !loading && !error && (
            <div className="player-wave">
              <span /><span /><span /><span />
            </div>
          )}
        </div>
        <div className="player-meta">
          <div className="player-station-name">{station.name}</div>
          <div className="player-station-detail">
            {station.country && <span>{station.country}</span>}
            {tags.map(t => <span key={t} className="player-tag">{t.trim()}</span>)}
            {error   && <span className="player-error-badge">Stream fout</span>}
            {loading && !error && <span className="player-loading-badge">Verbinden...</span>}
          </div>
        </div>
      </div>

      {/* Midden: afspeelknop */}
      <div className="player-controls">
        <button
          className={`player-play-btn ${playing && !error ? "playing" : ""}`}
          onClick={togglePlay}
          disabled={loading}
          title={playing ? "Pauzeer" : "Speel af"}
        >
          {loading
            ? <div className="btn-spinner" />
            : playing ? "⏸" : "▶"
          }
        </button>
      </div>

      {/* Rechts: volume-regelaar en sluitknop */}
      <div className="player-volume">
        <button
          className="volume-mute-btn"
          onClick={() => setMuted(m => !m)}
          title={muted ? "Geluid aan" : "Dempen"}
        >
          {muted || volume === 0 ? "🔇" : volume < 0.4 ? "🔈" : "🔊"}
        </button>
        <input
          type="range"
          min="0" max="1" step="0.02"
          value={muted ? 0 : volume}
          onChange={e => {
            setVolume(Number(e.target.value));
            if (muted) setMuted(false);
          }}
          className="volume-slider"
          title="Volume"
        />
        <button
          className="player-close-btn"
          onClick={onClose}
          title="Sluiten"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// klaar voor codereview