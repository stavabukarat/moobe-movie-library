import { Router } from 'express';

const router = Router();
const TMDB_BASE = 'https://api.themoviedb.org/3';

// GET /search?q=<query>
router.get('/', async (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const url = `${TMDB_BASE}/search/multi?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`;

  const response = await fetch(url);

  if (!response.ok) {
    return res.status(502).json({ error: 'Failed to fetch from TMDB' });
  }

  const data = await response.json();

  const results = data.results
    .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
    .map((item) => ({
      tmdbId: item.id,
      type: item.media_type === 'movie' ? 'Movie' : 'TV',
      title: item.media_type === 'movie' ? item.title : item.name,
      releaseDate: item.media_type === 'movie' ? item.release_date : item.first_air_date,
      posterPath: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null,
      overview: item.overview,
      voteAverage: item.vote_average,
    }));

  res.json({ results });
});

export default router;
