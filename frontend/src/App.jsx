import { useEffect, useRef, useState } from "react";
import "./App.css";
import { getRandomMovies, getRecommendations } from "./api";

export default function App() {
  const [randomMovies, setRandomMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(5);
  const [recommendations, setRecommendations] = useState([]);
  const [lastSearched, setLastSearched] = useState("");
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [loadingRec, setLoadingRec] = useState(false);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const [error, setError] = useState("");

  const searchRef = useRef(null);
  const cardRef = useRef(null);

  /* load random suggestions on mount */
  useEffect(() => {
    loadRandomMovies();
  }, []);

  /* Cursor Spotlight tracking */
  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  }

  async function loadRandomMovies() {
    setLoadingRandom(true);
    setError("");
    try {
      const movies = await getRandomMovies(5);
      setRandomMovies(movies);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRandom(false);
    }
  }

  /* clicking a suggestion fills the search bar */
  function handleSuggestionClick(movie) {
    setQuery(movie);
    searchRef.current?.focus();
  }

  /* get recommendations with randomized thinking timer (2s - 8s) */
  async function handleRecommend() {
    const movie = query.trim();
    if (!movie) {
      setError("Please type or pick a movie first.");
      return;
    }

    setLoadingRec(true);
    setError("");
    setRecommendations([]);
    setThinkingSeconds(1);

    // Random duration between 2 and 8 seconds
    const randomDurationSec = Math.floor(Math.random() * 7) + 2;
    const targetTimeMs = randomDurationSec * 1000;
    const startTime = Date.now();

    const timerInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000) + 1;
      if (elapsedSec <= randomDurationSec) {
        setThinkingSeconds(elapsedSec);
      }
    }, 1000);

    try {
      // Execute the original recommendation logic alongside the thinking timer delay
      const [results] = await Promise.all([
        getRecommendations(movie, count),
        new Promise((resolve) => setTimeout(resolve, targetTimeMs)),
      ]);
      clearInterval(timerInterval);
      const limited = results.slice(0, Number(count) || 1);
      setRecommendations(limited);
      setLastSearched(movie);
    } catch (err) {
      clearInterval(timerInterval);
      setError(err.message);
    } finally {
      setLoadingRec(false);
      setThinkingSeconds(0);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleRecommend();
  }

  return (
    <div className="app">
      <div className="card" ref={cardRef} onMouseMove={handleMouseMove}>
        <header className="header">
          <h1>🎬 Movie Recommender</h1>
          <p className="subtitle">Pick a movie, get AI-powered suggestions</p>
        </header>

        {/* SEARCH BAR */}
        <div className="search-row">
          <input
            ref={searchRef}
            type="text"
            className="search-input"
            placeholder="Search a movie…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* COUNT RANGE SLIDER + BUTTON */}
        <div className="controls-row">
          <div className="count-box">
            <div className="count-label-row">
              <label htmlFor="count">How many?</label>
              <span className="count-badge">{count}</span>
            </div>
            <input
              id="count"
              type="range"
              min="1"
              max="10"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="volume-slider"
            />
            <div className="range-limits">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          <button
            className="primary-btn"
            onClick={handleRecommend}
            disabled={loadingRec}
          >
            {loadingRec ? (
              <span className="btn-loading-content">
                <span className="circle-spinner"></span>
                Thinking {thinkingSeconds}s...
              </span>
            ) : (
              "Get Recommendations"
            )}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {/* RANDOM SUGGESTIONS */}
        <section className="section">
          <div className="section-head">
            <h2>Try one of these</h2>
            <button
              className="ghost-btn"
              onClick={loadRandomMovies}
              disabled={loadingRandom}
            >
              {loadingRandom ? "Loading…" : "↻ Shuffle"}
            </button>
          </div>

          <div className="chips">
            {randomMovies.map((movie, i) => (
              <button
                key={`${movie}-${i}`}
                className="chip"
                onClick={() => handleSuggestionClick(movie)}
              >
                {movie}
              </button>
            ))}
            {!loadingRandom && randomMovies.length === 0 && (
              <span className="muted">No suggestions available.</span>
            )}
          </div>
        </section>

        {/* SKELETON LOADING STATE */}
        {loadingRec && (
          <section className="section">
            <h2>Finding recommendations...</h2>
            <ul className="results">
              {Array.from({ length: Number(count) || 3 }).map((_, i) => (
                <li key={`skeleton-${i}`} className="result-item skeleton-item">
                  <span className="rank skeleton-pulse"></span>
                  <span className="title skeleton-pulse skeleton-line"></span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* RESULTS */}
        {!loadingRec && recommendations.length > 0 && (
          <section className="section">
            <h2>
              Because you liked <span className="accent">{lastSearched}</span>
            </h2>

            <ul className="results">
              {recommendations.map((item, i) => {
                const title =
                  typeof item === "string"
                    ? item
                    : item.title || item.name || item.movie || JSON.stringify(item);

                return (
                  <li
                    key={`${title}-${i}`}
                    className="result-item"
                    onClick={() => setQuery(title)}
                    title="Click to search this movie"
                  >
                    <span className="rank">{i + 1}</span>
                    <span className="title">{title}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}