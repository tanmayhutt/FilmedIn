import { fetchTrendingMovies, fetchTrendingTV } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";

export async function TrendingMovies() {
  let movies: any[] = [];
  try {
    movies = await fetchTrendingMovies();
  } catch (e) {
    console.error("Failed to fetch trending movies", e);
  }

  return (
    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
      {movies.length > 0 ? (
        movies.map((movie: any) => (
          <MediaCard key={movie.id} media={movie} />
        ))
      ) : (
        <div className="text-zinc-500 text-sm italic py-4">No movies found. Please configure your TMDB API Key.</div>
      )}
    </div>
  );
}

export async function TrendingTV() {
  let shows: any[] = [];
  try {
    shows = await fetchTrendingTV();
  } catch (e) {
    console.error("Failed to fetch trending tv", e);
  }

  return (
    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
      {shows.length > 0 ? (
        shows.map((tv: any) => (
          <MediaCard key={tv.id} media={tv} />
        ))
      ) : (
        <div className="text-zinc-500 text-sm italic py-4">No TV shows found. Please configure your TMDB API Key.</div>
      )}
    </div>
  );
}

export function TrendingSkeleton() {
  return (
    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="min-w-[160px] sm:min-w-[200px] aspect-[2/3] rounded-lg bg-zinc-900/50 animate-pulse border border-zinc-800/50"></div>
      ))}
    </div>
  );
}
