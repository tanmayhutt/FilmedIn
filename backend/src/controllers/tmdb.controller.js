const NodeCache = require('node-cache');

const tmdbCache = new NodeCache({ stdTTL: 7200, checkperiod: 120, maxKeys: 2000 });
const inFlightRequests = new Map();
const TMDB_BASE_URL = 'https://api.tmdb.org/3';
const DEFAULT_TTL = 7200;

function cacheResponse(key, data, ttl) {
  try {
    tmdbCache.set(key, data, ttl);
  } catch (error) {
    if (error?.errorcode !== 'ECACHEFULL') throw error;
    tmdbCache.flushAll();
    tmdbCache.set(key, data, ttl);
  }
}

function buildTmdbUrl(pathname, params = {}) {
  if (!process.env.TMDB_API_KEY) throw new Error('TMDB API is not configured');
  const url = new URL(`${TMDB_BASE_URL}${pathname}`);
  url.searchParams.set('api_key', process.env.TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });
  return url;
}

async function fetchWithCache(cacheKey, url, ttl = DEFAULT_TTL) {
  const cachedData = tmdbCache.get(cacheKey);
  if (cachedData) return cachedData;

  if (inFlightRequests.has(cacheKey)) return inFlightRequests.get(cacheKey);

  const request = (async () => {
    const staleKey = `stale:${cacheKey}`;
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`TMDB request failed with status ${response.status}`);

      const data = await response.json();
      cacheResponse(cacheKey, data, ttl);
      cacheResponse(staleKey, data, Math.max(ttl * 6, 86400));
      return data;
    } catch (error) {
      const staleData = tmdbCache.get(staleKey);
      if (staleData) return staleData;
      throw error;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, request);
  return request;
}

function setPublicCache(res, seconds) {
  res.set('Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=${Math.max(seconds * 4, 3600)}`);
}

function getMediaType(value) {
  return value === 'tv' ? 'tv' : value === 'movie' || value === undefined ? 'movie' : null;
}

function getPositiveInteger(value, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= max ? parsed : null;
}

function handleProxyError(res, error) {
  console.error('[TMDB Proxy Error]:', error.message);
  res.status(502).json({ error: 'The movie catalogue is temporarily unavailable' });
}

exports.getTrendingMovies = async (_req, res) => {
  try {
    const data = await fetchWithCache('trending_movie_day', buildTmdbUrl('/trending/movie/day'), 3600);
    setPublicCache(res, 3600);
    res.json(data);
  } catch (error) {
    handleProxyError(res, error);
  }
};

exports.getTrendingTV = async (_req, res) => {
  try {
    const data = await fetchWithCache('trending_tv_day', buildTmdbUrl('/trending/tv/day'), 3600);
    setPublicCache(res, 3600);
    res.json(data);
  } catch (error) {
    handleProxyError(res, error);
  }
};

exports.getTopRated = async (req, res) => {
  try {
    const mediaType = getMediaType(req.params.type);
    if (!mediaType) return res.status(400).json({ error: 'Media type must be movie or tv' });
    const data = await fetchWithCache(`top_rated_${mediaType}`, buildTmdbUrl(`/${mediaType}/top_rated`, { language: 'en-US', page: 1 }), 3600);
    setPublicCache(res, 3600);
    res.json(data);
  } catch (error) {
    handleProxyError(res, error);
  }
};

exports.searchMedia = async (req, res) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim().slice(0, 100) : '';
    if (query.length < 2) return res.status(400).json({ error: 'Search query must contain at least two characters' });
    const normalizedQuery = query.toLocaleLowerCase('en-US');
    const data = await fetchWithCache(`search_${normalizedQuery}`, buildTmdbUrl('/search/multi', { query }), 1800);
    setPublicCache(res, 1800);
    res.json(data);
  } catch (error) {
    handleProxyError(res, error);
  }
};

exports.getMovieDetails = async (req, res) => {
  try {
    const id = getPositiveInteger(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid movie ID' });
    const data = await fetchWithCache(`movie_${id}`, buildTmdbUrl(`/movie/${id}`, { append_to_response: 'credits' }));
    setPublicCache(res, DEFAULT_TTL);
    res.json(data);
  } catch (error) {
    handleProxyError(res, error);
  }
};

exports.getTVDetails = async (req, res) => {
  try {
    const id = getPositiveInteger(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid TV show ID' });
    const data = await fetchWithCache(`tv_${id}`, buildTmdbUrl(`/tv/${id}`, { append_to_response: 'credits' }));
    setPublicCache(res, DEFAULT_TTL);
    res.json(data);
  } catch (error) {
    handleProxyError(res, error);
  }
};

exports.getSeasonDetails = async (req, res) => {
  try {
    const id = getPositiveInteger(req.params.id);
    const season = getPositiveInteger(req.params.season, 200);
    if (!id || !season) return res.status(400).json({ error: 'Invalid TV show or season ID' });
    const data = await fetchWithCache(`tv_${id}_season_${season}`, buildTmdbUrl(`/tv/${id}/season/${season}`, { language: 'en-US' }));
    setPublicCache(res, DEFAULT_TTL);
    res.json(data);
  } catch (error) {
    handleProxyError(res, error);
  }
};

exports.getByGenre = async (req, res) => {
  try {
    const genreId = getPositiveInteger(req.query.genre_id);
    const mediaType = getMediaType(req.query.type);
    const page = getPositiveInteger(req.query.page || 1, 500);
    if (!genreId || !mediaType || !page) return res.status(400).json({ error: 'Invalid genre, media type, or page' });

    const cacheKey = `genre_${mediaType}_${genreId}_page_${page}`;
    const data = await fetchWithCache(cacheKey, buildTmdbUrl(`/discover/${mediaType}`, {
      with_genres: genreId,
      sort_by: 'popularity.desc',
      page,
      language: 'en-US',
    }), 3600);
    setPublicCache(res, 3600);
    res.json(data);
  } catch (error) {
    handleProxyError(res, error);
  }
};

exports.getGenres = async (req, res) => {
  try {
    const mediaType = getMediaType(req.query.type);
    if (!mediaType) return res.status(400).json({ error: 'Media type must be movie or tv' });
    const data = await fetchWithCache(`genres_list_${mediaType}`, buildTmdbUrl(`/genre/${mediaType}/list`, { language: 'en-US' }), 86400);
    setPublicCache(res, 86400);
    res.json(data);
  } catch (error) {
    handleProxyError(res, error);
  }
};

exports.getByCompany = async (req, res) => {
  try {
    const companyId = getPositiveInteger(req.query.company_id);
    const genreId = req.query.genre_id ? getPositiveInteger(req.query.genre_id) : undefined;
    const mediaType = getMediaType(req.query.type);
    const page = getPositiveInteger(req.query.page || 1, 500);
    if (!companyId || !mediaType || !page || (req.query.genre_id && !genreId)) return res.status(400).json({ error: 'Invalid company, genre, media type, or page' });

    const cacheKey = `company_${companyId}_genre_${genreId || 'all'}_page_${page}_type_${mediaType}`;
    const data = await fetchWithCache(cacheKey, buildTmdbUrl(`/discover/${mediaType}`, {
      with_companies: companyId,
      with_genres: genreId,
      sort_by: 'popularity.desc',
      page,
      language: 'en-US',
    }), 3600);
    setPublicCache(res, 3600);
    res.json(data);
  } catch (error) {
    handleProxyError(res, error);
  }
};

exports.getByNetwork = async (req, res) => {
  try {
    const networkId = getPositiveInteger(req.query.network_id);
    const genreId = req.query.genre_id ? getPositiveInteger(req.query.genre_id) : undefined;
    const mediaType = getMediaType(req.query.type);
    const page = getPositiveInteger(req.query.page || 1, 500);
    if (!networkId || !mediaType || !page || (req.query.genre_id && !genreId)) return res.status(400).json({ error: 'Invalid network, genre, media type, or page' });

    const cacheKey = `network_${networkId}_genre_${genreId || 'all'}_page_${page}_type_${mediaType}`;
    const data = await fetchWithCache(cacheKey, buildTmdbUrl(`/discover/${mediaType}`, {
      with_networks: networkId,
      with_genres: genreId,
      sort_by: 'popularity.desc',
      page,
      language: 'en-US',
    }), 3600);
    setPublicCache(res, 3600);
    res.json(data);
  } catch (error) {
    handleProxyError(res, error);
  }
};
