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

export async function fetchByGenre(genreId: number, type: 'movie' | 'tv' = 'movie'): Promise<(TMDBMovie | TMDBTVShow)[]> {
  try {
    const data = await fetchApi(`/tmdb/discover?genre_id=${genreId}&type=${type}`);
    return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
  } catch {
    return [];
  }
}

export async function fetchByCompany(companyId: number, genreId?: number): Promise<TMDBMovie[]> {
  try {
    let url = `/tmdb/company?company_id=${companyId}`;
    if (genreId) url += `&genre_id=${genreId}`;
    const data = await fetchApi(url);
    return (data.results || []).map((item: any) => ({ ...item, media_type: 'movie' }));
  } catch {
    return [];
  }
}

export async function fetchByNetwork(networkId: number, genreId?: number): Promise<TMDBTVShow[]> {
  try {
    let url = `/tmdb/network?network_id=${networkId}`;
    if (genreId) url += `&genre_id=${genreId}`;
    const data = await fetchApi(url);
    return (data.results || []).map((item: any) => ({ ...item, media_type: 'tv' }));
  } catch {
    return [];
  }
}

export async function fetchGenres(type: 'movie' | 'tv'): Promise<{ id: number; name: string }[]> {
  try {
    const data = await fetchApi(`/tmdb/genres?type=${type}`);
    return data.genres || [];
  } catch {
    return [];
  }
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
}

export interface TMDBSeason {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  vote_average: number;
  episodes: TMDBEpisode[];
}

export async function fetchSeasonDetails(tvId: string, seasonNumber: number): Promise<TMDBSeason | null> {
  try {
    return await fetchApi(`/tmdb/tv/${tvId}/season/${seasonNumber}`);
  } catch {
    return null;
  }
}
