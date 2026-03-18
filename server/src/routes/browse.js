import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const TMDB_BASE = 'https://api.themoviedb.org/3';

function apiKey() {
  return `api_key=${process.env.TMDB_API_KEY}`;
}

function mapMovie(item) {
  return {
    tmdbId: item.id,
    type: 'Movie',
    title: item.title,
    releaseDate: item.release_date ?? null,
    posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    voteAverage: item.vote_average ?? 0,
  };
}

function mapTV(item) {
  return {
    tmdbId: item.id,
    type: 'TV',
    title: item.name,
    releaseDate: item.first_air_date ?? null,
    posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    voteAverage: item.vote_average ?? 0,
  };
}

async function tmdbGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('TMDB request failed');
  return res.json();
}

// All browse routes require auth
router.use(requireAuth);

// GET /movies/trending
router.get('/movies/trending', async (req, res) => {
  try {
    const data = await tmdbGet(`${TMDB_BASE}/trending/movie/week?${apiKey()}&language=en-US`);
    res.json({ results: data.results.map(mapMovie) });
  } catch {
    res.status(502).json({ error: 'Failed to fetch trending movies' });
  }
});

// GET /tv/trending
router.get('/tv/trending', async (req, res) => {
  try {
    const data = await tmdbGet(`${TMDB_BASE}/trending/tv/week?${apiKey()}&language=en-US`);
    res.json({ results: data.results.map(mapTV) });
  } catch {
    res.status(502).json({ error: 'Failed to fetch trending TV shows' });
  }
});

// GET /movies/genre/:genreId
router.get('/movies/genre/:genreId', async (req, res) => {
  const { genreId } = req.params;
  try {
    const data = await tmdbGet(
      `${TMDB_BASE}/discover/movie?${apiKey()}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=1`
    );
    res.json({ results: data.results.map(mapMovie) });
  } catch {
    res.status(502).json({ error: 'Failed to fetch movies by genre' });
  }
});

// GET /tv/genre/:genreId
router.get('/tv/genre/:genreId', async (req, res) => {
  const { genreId } = req.params;
  try {
    const data = await tmdbGet(
      `${TMDB_BASE}/discover/tv?${apiKey()}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=1`
    );
    res.json({ results: data.results.map(mapTV) });
  } catch {
    res.status(502).json({ error: 'Failed to fetch TV shows by genre' });
  }
});

export default router;
