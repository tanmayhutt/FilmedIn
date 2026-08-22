import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MediaCard } from '@/components/features/MediaCard';
import { TMDBMovie, TMDBTVShow, fetchByGenre, fetchTrendingMovies, fetchTrendingTV, fetchGenres, fetchTopRated } from '@/services/tmdb.service';
import { Film, Loader2, RefreshCw, Search, Tv } from 'lucide-react';
import { usePageMetadata } from '@/components/common/RouteMetadata';
import { Input } from '@/components/ui/input';

const exploreLinks = [
  { label: 'Popular movies', to: '/explore?type=movie', icon: Film },
  { label: 'Popular TV shows', to: '/explore?type=tv', icon: Tv },
  { label: 'Top-rated movies', to: '/explore?type=movie&sort=top_rated', icon: Film },
  { label: 'Top-rated TV shows', to: '/explore?type=tv&sort=top_rated', icon: Tv },
];

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as 'movie' | 'tv' | null;
  const genreId = searchParams.get('genre');
  const sort = searchParams.get('sort');

  const [media, setMedia] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [title, setTitle] = useState('Explore Movies and TV Shows');
  const [searchValue, setSearchValue] = useState('');

  usePageMetadata(title, 'Browse popular movies, TV shows, genres, studios, and curated recommendations on FilmedIn.');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        let results: (TMDBMovie | TMDBTVShow)[] = [];
        let newTitle = 'Popular Movies';
        
        if (type === 'movie' || type === 'tv') {
          if (genreId) {
            // Fetch by genre
            results = await fetchByGenre(parseInt(genreId), type);
            // Fetch genre name to set title
            const genres = await fetchGenres(type);
            const foundGenre = genres.find(g => g.id.toString() === genreId);
            newTitle = foundGenre ? `${foundGenre.name} ${type === 'movie' ? 'Movies' : 'TV Shows'}` : `Explore ${type === 'movie' ? 'Movies' : 'TV'}`;
          } else {
            // Fetch popular/trending
            results = sort === 'top_rated'
              ? await fetchTopRated(type)
              : type === 'movie' ? await fetchTrendingMovies() : await fetchTrendingTV();
            newTitle = sort === 'top_rated' ? `Top Rated ${type === 'movie' ? 'Movies' : 'TV Shows'}` : `Popular ${type === 'movie' ? 'Movies' : 'TV Shows'}`;
          }
        } else {
          // Both or none selected, just fetch trending movies as default
          results = await fetchTrendingMovies();
          newTitle = 'Popular Movies';
        }
        
        if (!cancelled) {
          setMedia(results);
          setTitle(newTitle);
        }
      } catch (err) {
        console.error('Failed to load explore data', err);
        if (!cancelled) {
          setMedia([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();

    return () => { cancelled = true; };
  }, [type, genreId, sort, retryKey]);

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="clay-card p-8 sm:p-10 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 clay-badge-blue text-xs font-mono font-bold uppercase tracking-wider mb-3">
          Explore Curation
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white capitalize">
          {title}
        </h1>
        <p className="text-zinc-300 mt-2 text-sm sm:text-base">
          Browse current favorites across film and television, then narrow the collection by format, rating, or genre.
        </p>
        <form
          role="search"
          className="mt-6 flex max-w-2xl gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (searchValue.trim()) navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
          }}
        >
          <label htmlFor="explore-title-search" className="sr-only">Search movies and TV shows</label>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            <Input id="explore-title-search" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-white placeholder:text-zinc-500" placeholder="Find a movie or TV show" autoComplete="off" />
          </div>
          <button type="submit" disabled={!searchValue.trim()} className="clay-button-primary h-12 px-5 text-sm disabled:opacity-50">Search</button>
        </form>
        <nav aria-label="Explore collections" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {exploreLinks.map(({ label, to, icon: Icon }) => (
            <Link key={to} to={to} className="clay-button-secondary px-4 py-3 text-sm inline-flex items-center justify-center gap-2">
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 clay-card" role="status" aria-live="polite">
          <Loader2 className="w-10 h-10 text-zinc-500 animate-spin" />
          <p className="mt-4 text-sm text-zinc-300">Loading the latest titles</p>
        </div>
      ) : error ? (
        <section className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-5 clay-card p-10 sm:p-12" aria-labelledby="explore-unavailable-title">
          <RefreshCw className="w-9 h-9 text-zinc-300" aria-hidden="true" />
          <h2 id="explore-unavailable-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Titles are temporarily unavailable</h2>
          <p className="text-base text-zinc-300 max-w-xl">
            FilmedIn could not reach the movie catalogue. The rest of the site is available, and you can retry this collection now.
          </p>
          <button type="button" onClick={() => setRetryKey(value => value + 1)} className="clay-button-primary px-6 py-3 inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </button>
        </section>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
          {media.map(item => (
            <MediaCard key={`${item.media_type}-${item.id}`} media={item} />
          ))}
        </div>
      ) : (
        <section className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-5 clay-card p-12">
          <Film className="w-9 h-9 text-zinc-300" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">No titles in this collection yet</h2>
          <p className="text-base text-zinc-300">
            Try another collection above or return later as the catalogue changes.
          </p>
        </section>
      )}
    </main>
  );
}
