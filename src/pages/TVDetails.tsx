import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchTVDetails, TMDBTVShow } from '@/lib/tmdb'
import { AddToListButton } from '@/components/AddToListButton'
import { WallpaperGenerator } from '@/components/WallpaperGenerator'

export default function TVDetails() {
  const { id } = useParams<{ id: string }>()
  const [show, setShow] = useState<TMDBTVShow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      setLoading(true)
      fetchTVDetails(id).then(data => {
        setShow(data)
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

  if (!show) {
    return <main className="p-12 text-center">TV Show not found.</main>
  }

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in">
      <Link to="/" className="text-zinc-500 hover:text-white mb-8 inline-block transition-colors">
        ← Back
      </Link>

      <div className="flex flex-col md:flex-row gap-8 sm:gap-12">
        <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
          <div className="aspect-[2/3] w-full rounded-lg bg-zinc-900 overflow-hidden shadow-2xl relative mb-6">
            {show.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} 
                alt={show.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-600">No Image</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <AddToListButton tmdbId={show.id} mediaType="tv" />
            <WallpaperGenerator tmdbId={show.id} mediaType="tv" title={show.name} />
          </div>
        </div>

        <div className="flex-1 flex flex-col pt-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-2">
            {show.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-8 font-medium">
            {show.first_air_date && <span>{new Date(show.first_air_date).getFullYear()}</span>}
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <div className="flex items-center gap-1 text-yellow-500">
              <span>★</span>
              <span>{show.vote_average.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-lg text-zinc-300 leading-relaxed max-w-3xl mb-12">
            {show.overview}
          </p>

          <h2 className="text-xl font-semibold mb-6">Cast</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {show.credits?.cast?.slice(0, 10).map((actor: any) => (
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
    </main>
  )
}
