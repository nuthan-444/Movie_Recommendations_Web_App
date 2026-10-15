import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

/* ---------- random movies ---------- */
export async function getRandomMovies(n) {
  let res;
  
  // 1. Handle Network or HTTP errors (404, 500, etc.)
  try {
    res = await api.get(`/api/getRandomMovies/${n}`);
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

  // 2. Handle Backend Logical errors (HTTP 200, but logic failed)
  const data = res?.data;
  if (!data || !data.status) {
    throw new Error(data?.message || data?.error || "Failed to fetch random movies");
  }

  return data.random_movies;
}

/* ---------- recommendations ---------- */
export async function getRecommendations(movie, n) {
  let res;

  // 1. Handle Network or HTTP errors (404, 500, etc.)
  try {
    res = await api.post("/api/recommend", { movie, n });
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

  // 2. Handle Backend Logical errors (HTTP 200, but logic failed)
  const data = res?.data;
  if (!data || !data.status) {
    throw new Error(data?.message || data?.error || "Failed to get recommendations");
  }

  return data.recommendMovies;
}