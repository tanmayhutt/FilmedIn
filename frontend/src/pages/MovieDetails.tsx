import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchMovieDetails, TMDBMovie } from '@/services/tmdb.service'
import { AddToListButton } from '@/components/features/AddToListButton'
import { WallpaperGenerator } from '@/components/features/WallpaperGenerator'
import { Star } from 'lucide-react'
import { usePageMetadata } from '@/components/common/RouteMetadata'

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<TMDBMovie | null>(null)
  const [loading, setLoading] = useState(true)

  usePageMetadata(
    movie?.title,
    movie?.overview || (movie ? `View details, cast, rating, and playlists for ${movie.title}.` : undefined),
    movie?.poster_path ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` : undefined
  )

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
        <div className="h-8 bg-[var(--theme-dark)] w-1/3 mb-4 rounded"></div>
        <div className="h-4 bg-[var(--theme-dark)] w-1/4 mb-12 rounded"></div>
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/3 aspect-[2/3] bg-[var(--theme-dark)] rounded-lg"></div>
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-[var(--theme-dark)] w-full rounded"></div>
            <div className="h-4 bg-[var(--theme-dark)] w-full rounded"></div>
            <div className="h-4 bg-[var(--theme-dark)] w-3/4 rounded"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!movie) {
    return <main className="p-12 text-center">Movie not found.</main>
  }

  const isUnreleased = movie.release_date ? new Date(movie.release_date).getTime() > Date.now() : false

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in">
      <Link to="/" className="px-4 py-2 clay-button-secondary text-xs inline-flex items-center mb-8">
        ← Back to Home
      </Link>

      <div className="flex flex-col md:flex-row gap-8 sm:gap-12">
        <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
          <div className="aspect-[2/3] w-full clay-poster overflow-hidden relative mb-6">
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 bg-[#1b1b22]">No Image</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <AddToListButton tmdbId={movie.id} mediaType="movie" />
          </div>
        </div>

        <div className="flex-1 flex flex-col pt-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
            {movie.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300 mb-8 font-medium">
            {movie.release_date && (
              <span className="px-3 py-1 clay-badge text-xs font-mono font-bold">{new Date(movie.release_date).getFullYear()}</span>
            )}
            {movie.runtime && (
              <span className="px-3 py-1 clay-badge text-xs font-mono font-bold">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            )}
            {movie.genres?.map((g: any) => (
              <span key={g.id} className="px-3.5 py-1 clay-badge-blue text-xs font-semibold">
                {g.name}
              </span>
            ))}
            
            {isUnreleased ? (
              <span className="px-3.5 py-1 clay-badge-blue text-xs font-bold">
                Unreleased: {new Date(movie.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            ) : (
              movie.vote_average > 0 && movie.vote_count > 5 && (
                <span className="px-3.5 py-1 clay-badge-amber text-xs font-bold flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-white stroke-none" />
                  {movie.vote_average.toFixed(1)} / 10
                </span>
              )
            )}
          </div>

          <div className="clay-card p-6 sm:p-8 mb-10">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Overview</h3>
            <p className="text-base sm:text-lg text-zinc-200 leading-relaxed font-medium">
              {movie.overview}
            </p>
          </div>

          <h2 className="text-xl font-bold mb-6 text-white">Cast</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {movie.credits?.cast?.slice(0, 10).map((actor: any) => (
              <Link to={`/person/${actor.id}`} key={actor.id} className="w-[120px] shrink-0 flex flex-col gap-2 group" aria-label={`View ${actor.name}'s filmography`}>
                <div className="aspect-[2/3] w-full clay-poster overflow-hidden relative">
                  {actor.profile_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} 
                      alt={actor.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500 p-2 text-center bg-[#1b1b22]">
                      No Photo
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm text-zinc-100 line-clamp-1">{actor.name}</div>
                  <div className="text-xs text-zinc-400 line-clamp-1">{actor.character}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 w-full border-t border-white/10 pt-16">
        <h2 className="text-3xl font-bold text-white mb-8">Generate Wallpapers</h2>
        <WallpaperGenerator tmdbId={movie.id} mediaType="movie" title={movie.title} />
      </div>
    </main>
  )
}
