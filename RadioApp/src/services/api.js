// Radio Browser API service
// Documentatie: https://api.radio-browser.info/

const FALLBACK_SERVERS = [
  "at1.api.radio-browser.info",
  "de1.api.radio-browser.info",
  "nl1.api.radio-browser.info"
];

// Onthoudt de gekozen server zodat we hem niet elke keer opnieuw hoeven op te zoeken.
let activeServer = null;

/**
 * Zoekt een beschikbare Radio Browser API server.
 * Probeert eerst de officiële server-discovery, valt terug op een hardcoded lijst.
 * @returns {Promise<string>} De basis-URL van de gekozen server.
 */
export async function getServer() {
  if (activeServer) return activeServer;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch("https://all.api.radio-browser.info/json/servers", {
      signal: controller.signal,
      headers: { "Accept": "application/json" }
    });

    clearTimeout(timeoutId);
    const servers = await res.json();

    if (servers && servers.length > 0) {
      activeServer = `https://${servers[0].name}`;
      return activeServer;
    }
  } catch (error) {
    console.warn("Server discovery mislukt, gebruik fallback:", error.message);
  }

  activeServer = `https://${FALLBACK_SERVERS[0]}`;
  return activeServer;
}

/**
 * Hulpfunctie: stuurt een GET-request naar de Radio Browser API
 * en geeft de JSON-response terug. Gooit een fout als de request mislukt.
 * @param {string} path - Het pad na '/json/', bijv. 'stations/search?...'
 * @returns {Promise<Array>} De JSON-response van de API.
 */
async function fetchFromAPI(path) {
  const server = await getServer();
  const url = `${server}/json/${path}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "RadioKaartApp/1.0" }
    });

    if (!res.ok) {
      throw new Error(`API Status Fout: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Fetch API Error:", error);
    throw error;
  }
}

// ── Publieke functies 

/**
 * Haalt radiostations op voor een specifiek land op basis van de ISO 3166-1 alpha-2 landcode.
 * Sorteert op populariteit (meest geklikt bovenaan).
 * @param {string} countryCode - Bijv. "NL", "DE", "US"
 * @param {Object} options - Opties: limit, tag (genre), hidebroken
 * @returns {Promise<Array>} Lijst van stations.
 */
export async function getStationsByCountry(countryCode, options = {}) {
  if (!countryCode) return [];

  const code = countryCode.trim().toUpperCase();
  const { limit = 100, tag = "", hidebroken = true } = options;
  const params = new URLSearchParams({
    limit: limit.toString(),
    hidebroken: hidebroken.toString(),
    order: "clickcount",
    reverse: "true",
    ...(tag && { tag }),
  });

  return fetchFromAPI(`stations/bycountrycodeexact/${code}?${params}`);
}

/**
 * Zoekt stations op naam via de Radio Browser API.
 * Optioneel te combineren met een genre-filter.
 * @param {string} query - De zoekterm, bijv. "BBC", "Radio 1"
 * @param {Object} options - Opties: limit, tag, hidebroken
 * @returns {Promise<Array>} Lijst van gevonden stations.
 */
export async function searchStations(query, options = {}) {
  if (!query) return [];
  const { limit = 50, tag = "", hidebroken = true } = options;
  const params = new URLSearchParams({
    name: query,
    limit: limit.toString(),
    hidebroken: hidebroken.toString(),
    order: "clickcount",
    reverse: "true",
    ...(tag && { tag }),
  });
  return fetchFromAPI(`stations/search?${params}`);
}

/**
 * Haalt de wereldwijd meest populaire stations op, gesorteerd op klikcount.
 * Wordt gebruikt als startscherm wanneer er nog geen land of zoekopdracht is.
 * @param {number} limit - Maximum aantal resultaten (standaard 20).
 * @returns {Promise<Array>} Lijst van populaire stations.
 */
export async function getTopStations(limit = 20) {
  return fetchFromAPI(
    `stations/search?limit=${limit}&hidebroken=true&order=clickcount&reverse=true`
  );
}

/**
 * Haalt stations op gefilterd op een genre/tag.
 * @param {string} tag - De genre-tag, bijv. "jazz", "rock", "news"
 * @param {number} limit - Maximum aantal resultaten.
 * @returns {Promise<Array>} Lijst van stations met dit genre.
 */
export async function getStationsByTag(tag, limit = 50) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    hidebroken: "true",
    order: "clickcount",
    reverse: "true",
  });
  return fetchFromAPI(`stations/bytag/${encodeURIComponent(tag)}?${params}`);
}

/**
 * Registreert een klik op een station bij de Radio Browser API.
 * Dit is belangrijk: het verhoogt de populariteitsscore van het station in de database,
 * zodat andere gebruikers het makkelijker kunnen vinden.
 * @param {string} stationUuid - De unieke UUID van het station.
 */
export async function registerClick(stationUuid) {
  if (!stationUuid) return;
  try {
    const server = await getServer();
    await fetch(`${server}/json/url/${stationUuid}`, { method: "GET" });
  } catch {
    // Niet kritiek — stille fout
  }
}

/**
 * Haalt een lijst op van alle landen met het aantal beschikbare stations.
 * Nuttig voor de kaart om te weten welke landen actief zijn.
 * @returns {Promise<Array>} Lijst van landen met stationcount.
 */
export async function getCountries() {
  return fetchFromAPI("countrycodes?hidebroken=true&order=stationcount&reverse=true");
}

// ── Constanten 

/**
 * Lijst van beschikbare genres voor de genre-filterknopppen.
 * id: de tag die naar de Radio Browser API gestuurd wordt (leeg = alle genres).
 * label: de weergavenaam in de UI.
 * icon: emoji-icoon voor visuele herkenbaarheid.
 */
export const GENRES = [
  { id: "",           label: "Alle genres", icon: "🌐" },
  { id: "pop",        label: "Pop",         icon: "🎵" },
  { id: "rock",       label: "Rock",        icon: "🎸" },
  { id: "jazz",       label: "Jazz",        icon: "🎷" },
  { id: "classical",  label: "Classical",   icon: "🎻" },
  { id: "news",       label: "News",        icon: "📰" },
  { id: "talk",       label: "Talk",        icon: "🎙️" },
  { id: "electronic", label: "Electronic",  icon: "🎛️" },
  { id: "hiphop",     label: "Hip-Hop",     icon: "🎤" },
  { id: "country",    label: "Country",     icon: "🤠" },
  { id: "latin",      label: "Latin",       icon: "💃" },
  { id: "blues",      label: "Blues",       icon: "🎺" },
];
