import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchTrendingMovies, fetchTrendingTV } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";

export default async function Home() {
  // We'll try to fetch, if API key is missing it might throw, so we catch and provide empty arrays
  let trendingMovies = [];
  let trendingTV = [];
  
  try {
    const [moviesData, tvData] = await Promise.all([
      fetchTrendingMovies(),
      fetchTrendingTV()
    ]);
    trendingMovies = moviesData;
    trendingTV = tvData;
  } catch (e) {
    console.error("Failed to fetch TMDB data", e);
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
      {/* Header & Search */}
      <header className="flex flex-col items-center gap-6 mt-10">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-50">FilmedIn</h1>
        <form action="/search" className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
          <Input 
            type="text" 
            name="q"
            placeholder="Search movies, tv shows..." 
            className="w-full pl-12 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-full h-14 text-lg focus-visible:ring-zinc-700 focus-visible:ring-offset-0"
          />
        </form>
      </header>

      {/* Trending Movies Carousel */}
      <section className="flex flex-col gap-4 mt-8">
        <h2 className="text-xl font-medium text-zinc-200 px-2">Trending Movies</h2>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
          {trendingMovies.length > 0 ? (
            trendingMovies.map(movie => (
              <MediaCard key={movie.id} media={movie} />
            ))
          ) : (
            <div className="text-zinc-500 text-sm italic py-4">No movies found. Please configure your TMDB API Key.</div>
          )}
        </div>
      </section>

      {/* Trending TV Carousel */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium text-zinc-200 px-2">Trending TV Shows</h2>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
          {trendingTV.length > 0 ? (
            trendingTV.map(tv => (
              <MediaCard key={tv.id} media={tv} />
            ))
          ) : (
            <div className="text-zinc-500 text-sm italic py-4">No TV shows found. Please configure your TMDB API Key.</div>
          )}
        </div>
      </section>
    </main>
  );
}
