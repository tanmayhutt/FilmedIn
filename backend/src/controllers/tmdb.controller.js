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

exports.getSeasonDetails = async (req, res) => {
  try {
    const { id, season } = req.params;
    const response = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${season}?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!response.ok) throw new Error('Failed to fetch season from TMDB');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.getByGenre = async (req, res) => {
  try {
    const { genre_id, type = 'movie', page = 1 } = req.query;
    if (!genre_id) return res.status(400).json({ error: 'genre_id is required' });
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_genres=${genre_id}&sort_by=popularity.desc&page=${page}&language=en-US`
    );
    if (!response.ok) throw new Error('Failed to fetch from TMDB');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

exports.getGenres = async (req, res) => {
  try {
    const { type = 'movie' } = req.query;
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!response.ok) throw new Error('Failed to fetch from TMDB');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};

// Fetch movies by production company (e.g. Marvel=420, Pixar=3, Universal=33)
exports.getByCompany = async (req, res) => {
  try {
    const { company_id, genre_id, page = 1 } = req.query;
    if (!company_id) return res.status(400).json({ error: 'company_id is required' });
    
    let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_companies=${company_id}&sort_by=popularity.desc&page=${page}&language=en-US`;
    if (genre_id) {
      url += `&with_genres=${genre_id}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      console.error('TMDB Error URL:', url, 'Response:', errText);
      throw new Error(`Failed to fetch from TMDB: ${response.status} ${errText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fetch TV shows by network (e.g. HBO=49, Netflix=213, Hulu=453)
exports.getByNetwork = async (req, res) => {
  try {
    const { network_id, genre_id, page = 1 } = req.query;
    if (!network_id) return res.status(400).json({ error: 'network_id is required' });
    
    let url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_networks=${network_id}&sort_by=popularity.desc&page=${page}&language=en-US`;
    if (genre_id) {
      url += `&with_genres=${genre_id}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      console.error('TMDB Error URL:', url, 'Response:', errText);
      throw new Error(`Failed to fetch from TMDB: ${response.status} ${errText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[TMDB Proxy Error]:', err.message);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
};
