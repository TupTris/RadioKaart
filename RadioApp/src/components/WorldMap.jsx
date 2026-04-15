import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

// TopoJSON van de publieke CDN van react-simple-maps
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ISO 3166-1 numeric → alpha-2 mapping (de landen die in jouw app gebruikt worden)
// react-simple-maps werkt met numerieke codes; Radio Browser API met alpha-2.
const NUMERIC_TO_ALPHA2 = {
  "004": "AF", "008": "AL", "012": "DZ", "024": "AO", "032": "AR",
  "036": "AU", "040": "AT", "031": "AZ", "050": "BD", "056": "BE",
  "068": "BO", "076": "BR", "100": "BG", "116": "KH", "120": "CM",
  "124": "CA", "152": "CL", "156": "CN", "170": "CO", "191": "HR",
  "192": "CU", "203": "CZ", "208": "DK", "218": "EC", "818": "EG",
  "231": "ET", "246": "FI", "250": "FR", "276": "DE", "288": "GH",
  "300": "GR", "320": "GT", "324": "GN", "348": "HU", "356": "IN",
  "360": "ID", "364": "IR", "368": "IQ", "372": "IE", "376": "IL",
  "380": "IT", "392": "JP", "400": "JO", "398": "KZ", "404": "KE",
  "408": "KP", "410": "KR", "414": "KW", "418": "LA", "422": "LB",
  "430": "LR", "434": "LY", "458": "MY", "484": "MX", "504": "MA",
  "516": "NA", "528": "NL", "554": "NZ", "566": "NG", "578": "NO",
  "586": "PK", "598": "PG", "604": "PE", "608": "PH", "616": "PL",
  "620": "PT", "642": "RO", "643": "RU", "682": "SA", "686": "SN",
  "694": "SL", "706": "SO", "710": "ZA", "724": "ES", "729": "SD",
  "752": "SE", "756": "CH", "760": "SY", "834": "TZ", "764": "TH",
  "792": "TR", "800": "UG", "804": "UA", "784": "AE", "826": "GB",
  "840": "US", "858": "UY", "860": "UZ", "862": "VE", "704": "VN",
  "887": "YE", "894": "ZM", "716": "ZW", "180": "CD", "178": "CG",
  "144": "LK", "496": "MN", "504": "MA", "466": "ML", "562": "NE",
  "478": "MR", "064": "BT", "760": "SY", "112": "BY", "703": "SK",
  "705": "SI", "688": "RS", "070": "BA", "807": "MK", "008": "AL",
  "498": "MD", "440": "LT", "428": "LV", "233": "EE", "268": "GE",
  "051": "AM", "792": "TR", "788": "TN", "104": "MM", "090": "SB",
  "242": "FJ", "450": "MG", "508": "MZ", "072": "BW", "060": "BM",
};

// Landen met veel populaire stations
const HIGH_ACTIVITY = new Set([
  "US","GB","DE","FR","BR","CA","AU","JP","RU","IN",
  "IT","ES","NL","PL","SE","TR","MX","KR","AR","ZA",
  "NO","FI","BE","CH","AT","UA","DK","PT","GR","RO",
]);

// Kleuren passend bij het bestaande dark-space thema
const COLOR = {
  land:     "#1a2d4a",
  active:   "#1e3a5f",
  hover:    "#2a4a72",
  selected: "rgba(0, 212, 255, 0.35)",
  ocean:    "#060d1a",
  stroke:   "#060d1a",
  strokeSel:"#00d4ff",
};

export default function WorldMap({ onCountrySelect, selectedCountry }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  // zoom state voor ZoomableGroup
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });

  function handleMoveEnd(pos) {
    setPosition(pos);
  }

  function getAlpha2(geo) {
    return NUMERIC_TO_ALPHA2[geo.id] ?? null;
  }

  function getFill(alpha2) {
    if (!alpha2) return COLOR.land;
    if (alpha2 === selectedCountry) return COLOR.selected;
    if (hoveredCountry === alpha2) return COLOR.hover;
    if (HIGH_ACTIVITY.has(alpha2)) return COLOR.active;
    return COLOR.land;
  }

  function getStroke(alpha2) {
    if (alpha2 === selectedCountry) return COLOR.strokeSel;
    return COLOR.stroke;
  }

  function getStrokeWidth(alpha2) {
    if (alpha2 === selectedCountry) return 1.5;
    return 0.5;
  }

  return (
    <div className="map-container">
      {/* Header */}
      <div className="map-header">
        <h2 className="map-title">Klik op een land om stations te zien</h2>
        {hoveredCountry && (
          <div className="map-tooltip">
            <span className="tooltip-flag">📻</span>
            <span>{hoveredCountry}</span>
          </div>
        )}
      </div>

      {/* Kaart */}
      <div className="map-wrapper">
        <ComposableMap
          projectionConfig={{ scale: 147, center: [0, 20] }}
          style={{ width: "100%", height: "auto", background: COLOR.ocean, borderRadius: "8px" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={6}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const alpha2 = getAlpha2(geo);
                  const isSelected = alpha2 === selectedCountry;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (!alpha2) return;
                        const name = geo.properties.name ?? alpha2;
                        onCountrySelect(alpha2, name);
                      }}
                      onMouseEnter={() => {
                        if (!alpha2) return;
                        const name = geo.properties.name ?? alpha2;
                        setHoveredCountry(name);
                      }}
                      onMouseLeave={() => setHoveredCountry(null)}
                      style={{
                        default: {
                          fill: getFill(alpha2),
                          stroke: getStroke(alpha2),
                          strokeWidth: getStrokeWidth(alpha2),
                          outline: "none",
                          cursor: alpha2 ? "pointer" : "default",
                          transition: "fill 0.18s",
                          ...(isSelected && {
                            filter: "drop-shadow(0 0 8px rgba(0,212,255,0.4))",
                          }),
                        },
                        hover: {
                          fill: alpha2 === selectedCountry ? COLOR.selected : COLOR.hover,
                          stroke: getStroke(alpha2),
                          strokeWidth: getStrokeWidth(alpha2),
                          outline: "none",
                          cursor: alpha2 ? "pointer" : "default",
                          filter: alpha2
                            ? "drop-shadow(0 0 6px rgba(0,212,255,0.3))"
                            : "none",
                        },
                        pressed: {
                          fill: COLOR.selected,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Zoom hint */}
      <p style={{
        fontSize: "10px",
        color: "var(--text-dim)",
        marginTop: "6px",
        textAlign: "right",
        letterSpacing: "0.3px",
      }}>
        Scroll om in te zoomen · Sleep om te pannen
      </p>

      {/* Snelkeuze populaire landen */}
      <div className="quick-countries">
        <span className="quick-label">Populair:</span>
        {[
          { code: "US", name: "🇺🇸 USA" },
          { code: "GB", name: "🇬🇧 UK" },
          { code: "DE", name: "🇩🇪 DE" },
          { code: "NL", name: "🇳🇱 NL" },
          { code: "FR", name: "🇫🇷 FR" },
          { code: "BR", name: "🇧🇷 BR" },
          { code: "JP", name: "🇯🇵 JP" },
          { code: "AU", name: "🇦🇺 AU" },
        ].map(c => (
          <button
            key={c.code}
            className={`quick-btn ${selectedCountry === c.code ? "active" : ""}`}
            onClick={() => onCountrySelect(c.code, c.name)}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// klaar voor codereview