const NodeCache = require('node-cache');
// Standard TTL is 2 hours (7200 seconds)
const tmdbCache = new NodeCache({ stdTTL: 7200, checkperiod: 120 });

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.tmdb.org/3';

// Helper function to fetch with caching
const fetchWithCache = async (cacheKey, url, ttl = 7200) => {
  const cachedData = tmdbCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errText = await response.text();
    console.error('TMDB Error URL:', url, 'Response:', errText);
    throw new Error(`Failed to fetch from TMDB: ${response.status} ${errText}`);
  }
  
  const data = await response.json();
  // Store in cache
  tmdbCache.set(cacheKey, data, ttl);
  return data;
};

exports.getTrendingMovies = async (req, res) => {
  try {
    const cacheKey = 'trending_movie_day';
    const url = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`;
    // Trending updates daily, cache for 1 hour (3600)
    const data = await fetchWithCache(cacheKey, url, 3600);
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.getTrendingTV = async (req, res) => {
  try {
    const cacheKey = 'trending_tv_day';
    const url = `${TMDB_BASE_URL}/trending/tv/day?api_key=${TMDB_API_KEY}`;
    // Trending updates daily, cache for 1 hour (3600)
    const data = await fetchWithCache(cacheKey, url, 3600);
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.searchMedia = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    
    const cacheKey = `search_${query}`;
    const url = `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`;
    // Search results are dynamic, cache for 30 minutes (1800)
    const data = await fetchWithCache(cacheKey, url, 1800);
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `movie_${id}`;
    const url = `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
    const data = await fetchWithCache(cacheKey, url);
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.getTVDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `tv_${id}`;
    const url = `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
    const data = await fetchWithCache(cacheKey, url);
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.getSeasonDetails = async (req, res) => {
  try {
    const { id, season } = req.params;
    const cacheKey = `tv_${id}_season_${season}`;
    const url = `${TMDB_BASE_URL}/tv/${id}/season/${season}?api_key=${TMDB_API_KEY}&language=en-US`;
    const data = await fetchWithCache(cacheKey, url);
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.getByGenre = async (req, res) => {
  try {
    const { genre_id, type = 'movie', page = 1 } = req.query;
    if (!genre_id) return res.status(400).json({ error: 'genre_id is required' });
    
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const cacheKey = `genre_${mediaType}_${genre_id}_page_${page}`;
    const url = `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_genres=${genre_id}&sort_by=popularity.desc&page=${page}&language=en-US`;
    
    // Discover pages update rarely, cache for 1 hour
    const data = await fetchWithCache(cacheKey, url, 3600);
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.getGenres = async (req, res) => {
  try {
    const { type = 'movie' } = req.query;
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const cacheKey = `genres_list_${mediaType}`;
    const url = `${TMDB_BASE_URL}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}&language=en-US`;
    
    // Genres never change, cache for 24 hours (86400)
    const data = await fetchWithCache(cacheKey, url, 86400);
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

// Fetch movies by production company (e.g. Marvel=420, Pixar=3, Universal=33)
exports.getByCompany = async (req, res) => {
  try {
    const { company_id, genre_id, page = 1, type = 'movie' } = req.query;
    if (!company_id) return res.status(400).json({ error: 'company_id is required' });
    
    const cacheKey = `company_${company_id}_genre_${genre_id || 'all'}_page_${page}_type_${type}`;
    let url = `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&with_companies=${company_id}&sort_by=popularity.desc&page=${page}&language=en-US`;
    if (genre_id) {
      url += `&with_genres=${genre_id}`;
    }
    
    const data = await fetchWithCache(cacheKey, url, 3600);
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fetch TV shows by network (e.g. HBO=49, Netflix=213, Hulu=453)
exports.getByNetwork = async (req, res) => {
  try {
    const { network_id, genre_id, page = 1, type = 'tv' } = req.query;
    if (!network_id) return res.status(400).json({ error: 'network_id is required' });
    
    const cacheKey = `network_${network_id}_genre_${genre_id || 'all'}_page_${page}_type_${type}`;
    let url = `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&with_networks=${network_id}&sort_by=popularity.desc&page=${page}&language=en-US`;
    if (genre_id) {
      url += `&with_genres=${genre_id}`;
    }

    const data = await fetchWithCache(cacheKey, url, 3600);
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};
