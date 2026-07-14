const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || import.meta.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  media_type?: 'movie';
  runtime?: number;
  credits?: any;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  media_type?: 'tv';
  number_of_seasons?: number;
  credits?: any;
}

export async function fetchTrendingMovies(): Promise<TMDBMovie[]> {
  const res = await fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch trending movies');
  const data = await res.json();
  return data.results;
}

export async function fetchTrendingTV(): Promise<TMDBTVShow[]> {
  const res = await fetch(`${TMDB_BASE_URL}/trending/tv/day?api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch trending TV shows');
  const data = await res.json();
  return data.results;
}

export async function searchMedia(query: string): Promise<(TMDBMovie | TMDBTVShow)[]> {
  const res = await fetch(`${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error('Failed to search media');
  const data = await res.json();
  return data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
}

export async function fetchMovieDetails(id: string): Promise<TMDBMovie | null> {
  const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchTVDetails(id: string): Promise<TMDBTVShow | null> {
  const res = await fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
  if (!res.ok) return null;
  return res.json();
}
