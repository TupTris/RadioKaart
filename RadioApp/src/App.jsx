import { useState } from "react";
import Home from "./pages/Home";
import Player from "./components/Player";
import "./App.css";

/**
 * App is de root-component van de applicatie.
 * Beheert de staat van het huidig afspelende station en geeft dit door
 * aan de Player-component (sticky onderaan) en de Home-pagina.
 */
export default function App() {
  // currentStation: het station dat momenteel wordt afgespeeld (null = niets)
  const [currentStation, setCurrentStation] = useState(null);

  /**
   * Wordt aangeroepen wanneer de gebruiker op een station klikt.
   * Als hetzelfde station opnieuw geklikt wordt, stopt het afspelen.
   * @param {Object} station - Het station-object vanuit de Radio Browser API.
   */
  function handlePlay(station) {
    if (currentStation?.stationuuid === station.stationuuid) {
      setCurrentStation(null);
    } else {
      setCurrentStation(station);
    }
  }

  return (
    <div className={`app ${currentStation ? "has-player" : ""}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-text">RadioKaart</span>
          </div>
          <div className="header-tagline">
            Live radio uit elk land ter wereld
          </div>
        </div>
      </header>

      {/* Hoofdinhoud */}
      <main className="app-main">
        <Home
          currentStation={currentStation}
          onPlay={handlePlay}
        />
      </main>

      {/* Sticky player onderaan — alleen zichtbaar als er een station speelt */}
      {currentStation && (
        <Player
          station={currentStation}
          onClose={() => setCurrentStation(null)}
        />
      )}
    </div>
  );
}
