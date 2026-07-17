import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchMovieDetails, TMDBMovie } from '@/services/tmdb.service'
import { AddToListButton } from '@/components/features/AddToListButton'
import { WallpaperGenerator } from '@/components/features/WallpaperGenerator'
import { Star } from 'lucide-react'

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<TMDBMovie | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (id) {
      setLoading(true)
      fetchMovieDetails(id).then(data => {
        setMovie(data)
        setLoading(false)
      }).catch(e => {
        console.error(e)
        setLoading(false)
      })
    }
  }, [id])

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
        <div className="h-8 bg-zinc-900 w-1/3 mb-4 rounded"></div>
        <div className="h-4 bg-zinc-900 w-1/4 mb-12 rounded"></div>
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/3 aspect-[2/3] bg-zinc-900 rounded-lg"></div>
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-zinc-900 w-full rounded"></div>
            <div className="h-4 bg-zinc-900 w-full rounded"></div>
            <div className="h-4 bg-zinc-900 w-3/4 rounded"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!movie) {
    return <main className="p-12 text-center">Movie not found.</main>
  }

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in">
      <Link to="/" className="text-zinc-500 hover:text-white mb-8 inline-block transition-colors">
        ← Back
      </Link>

      <div className="flex flex-col md:flex-row gap-8 sm:gap-12">
        <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
          <div className="aspect-[2/3] w-full rounded-lg bg-zinc-900 overflow-hidden shadow-2xl relative mb-6">
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-600">No Image</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <AddToListButton tmdbId={movie.id} mediaType="movie" />
          </div>
        </div>

        <div className="flex-1 flex flex-col pt-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-2">
            {movie.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-8 font-medium">
            {movie.release_date && <span>{new Date(movie.release_date).getFullYear()}</span>}
            {movie.runtime && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              </>
            )}
            {movie.vote_average > 0 && (
              <span className="flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 font-bold text-sm px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-yellow-400 stroke-none" />
                {movie.vote_average.toFixed(1)}
                <span className="text-yellow-600 font-normal text-xs">/ 10</span>
              </span>
            )}
          </div>

          <p className="text-lg text-zinc-300 leading-relaxed max-w-3xl mb-12">
            {movie.overview}
          </p>

          <h2 className="text-xl font-semibold mb-6">Cast</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {movie.credits?.cast?.slice(0, 10).map((actor: any) => (
              <div key={actor.id} className="w-[120px] shrink-0 flex flex-col gap-2 group">
                <div className="aspect-[2/3] w-full rounded-lg bg-zinc-900 overflow-hidden relative border border-zinc-800/50 group-hover:border-zinc-700 transition-colors">
                  {actor.profile_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} 
                      alt={actor.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-600 p-2 text-center">
                      No Photo
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm text-zinc-100 line-clamp-1">{actor.name}</div>
                  <div className="text-xs text-zinc-500 line-clamp-1">{actor.character}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 w-full border-t border-zinc-800/50 pt-16">
        <h2 className="text-3xl font-bold text-zinc-100 mb-8">Generate Wallpapers</h2>
        <WallpaperGenerator tmdbId={movie.id} mediaType="movie" title={movie.title} />
      </div>
    </main>
  )
}
