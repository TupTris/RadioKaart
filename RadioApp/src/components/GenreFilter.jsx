import { GENRES } from "../services/api";

/**
 * GenreFilter toont een rij knoppen waarmee de gebruiker kan filteren op muziekgenre.
 * De beschikbare genres komen uit de GENRES-constante in api.js.
 * @param {string}   selectedGenre - Het ID van het momenteel geselecteerde genre.
 * @param {Function} onGenreSelect - Callback die wordt aangeroepen met het nieuwe genre-ID.
 */
export default function GenreFilter({ selectedGenre, onGenreSelect }) {
  return (
    <div className="genre-filter">
      <span className="genre-title">Genre</span>
      <div className="genre-list">
        {/* Maak voor elk genre een knop aan */}
        {GENRES.map(genre => (
          <button
            key={genre.id}
            className={`genre-btn ${selectedGenre === genre.id ? "active" : ""}`}
            onClick={() => onGenreSelect(genre.id)}
            title={genre.label}
          >
            <span className="genre-icon">{genre.icon}</span>
            <span className="genre-label">{genre.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
