import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MediaCard } from '@/components/features/MediaCard';
import { TMDBMovie, TMDBTVShow, fetchByGenre, fetchTrendingMovies, fetchTrendingTV, fetchGenres } from '@/services/tmdb.service';
import { Loader2, Construction } from 'lucide-react';

export default function Explore() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as 'movie' | 'tv' | null;
  const genreId = searchParams.get('genre');
  const sort = searchParams.get('sort');

  const [media, setMedia] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('Explore');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let results: (TMDBMovie | TMDBTVShow)[] = [];
        let newTitle = 'Explore Categories';
        
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
            results = type === 'movie' ? await fetchTrendingMovies() : await fetchTrendingTV();
            newTitle = sort === 'top_rated' ? `Top Rated ${type === 'movie' ? 'Movies' : 'TV Shows'}` : `Popular ${type === 'movie' ? 'Movies' : 'TV Shows'}`;
          }
        } else {
          // Both or none selected, just fetch trending movies as default
          results = await fetchTrendingMovies();
          newTitle = 'Popular Movies';
        }
        
        setMedia(results);
        setTitle(newTitle);
      } catch (err) {
        console.error('Failed to load explore data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [type, genreId, sort]);

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
          Discover hand-picked content from across the FilmedIn network.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
          {media.map(item => (
            <MediaCard key={`${item.media_type}-${item.id}`} media={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 clay-card p-12">
          <div className="w-20 h-20 clay-badge flex items-center justify-center mb-2">
            <Construction className="w-10 h-10 text-zinc-300" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">No Results Found</h1>
          <p className="text-base text-zinc-300">
            We couldn't find any media matching these criteria.
          </p>
        </div>
      )}
    </main>
  );
}
