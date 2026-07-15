import { fetchApi } from './api.client';

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
  const data = await fetchApi('/tmdb/trending/movie');
  return data.results;
}

export async function fetchTrendingTV(): Promise<TMDBTVShow[]> {
  const data = await fetchApi('/tmdb/trending/tv');
  return data.results;
}

export async function searchMedia(query: string): Promise<(TMDBMovie | TMDBTVShow)[]> {
  const data = await fetchApi(`/tmdb/search?query=${encodeURIComponent(query)}`);
  return data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
}

export async function fetchMovieDetails(id: string): Promise<TMDBMovie | null> {
  try {
    return await fetchApi(`/tmdb/movie/${id}`);
  } catch (err) {
    return null;
  }
}

export async function fetchTVDetails(id: string): Promise<TMDBTVShow | null> {
  try {
    return await fetchApi(`/tmdb/tv/${id}`);
  } catch (err) {
    return null;
  }
}
