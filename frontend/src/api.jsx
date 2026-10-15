import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

/* ---------- random movies ---------- */
export async function getRandomMovies(n) {
  try {
    const res = await api.get(`/api/getRandomMovies/${n}`);
    const data = res.data;

    // Backend returns 200 even on logical errors → check status field
    if (!data.status) {
      throw new Error(data.message || data.error || "Failed to fetch random movies");
    }
    return data.random_movies;
  } catch (err) {
    if (err.response) {
      throw new Error(
        err.response.data?.message ||
          err.response.data?.error ||
          "Server error"
      );
    }
    throw new Error(err.message || "Network error");
  }
}

/* ---------- recommendations ---------- */
export async function getRecommendations(movie,n) {
  try {
    const res = await api.post("/api/recommend", { movie,n });
    const data = res.data;

    if (!data.status) {
      throw new Error(data.message || data.error || "Failed to get recommendations");
    }
    return data.recommendMovies;
  } catch (err) {
    if (err.response) {
      throw new Error(
        err.response.data?.message ||
          err.response.data?.error ||
          "Server error"
      );
    }
    throw new Error(err.message || "Network error");
  }
}