const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

exports.getTrendingMovies = async (req, res) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch from TMDB');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.getTrendingTV = async (req, res) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/tv/day?api_key=${TMDB_API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch from TMDB');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.searchMedia = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    const response = await fetch(`${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch from TMDB');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
    if (!response.ok) throw new Error('Failed to fetch from TMDB');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.getTVDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
    if (!response.ok) throw new Error('Failed to fetch from TMDB');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};
