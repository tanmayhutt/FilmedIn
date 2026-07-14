import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchMedia, TMDBMovie, TMDBTVShow } from '@/lib/tmdb'
import { MediaCard } from '@/components/MediaCard'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [shows, setShows] = useState<TMDBTVShow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query) {
      setMovies([])
      setShows([])
      setLoading(false)
      return
    }

    setLoading(true)
    searchMedia(query).then(results => {
      setMovies(results.filter(item => item.media_type === 'movie') as TMDBMovie[])
      setShows(results.filter(item => item.media_type === 'tv') as TMDBTVShow[])
      setLoading(false)
    }).catch(e => {
      console.error(e)
      setLoading(false)
    })
  }, [query])

  if (!query) {
    return (
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl font-bold mb-8">Search</h1>
        <p className="text-zinc-400">Enter a search term above.</p>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in">
      <h1 className="text-3xl font-bold mb-8">Search results for "{query}"</h1>

      {loading ? (
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-6">Movies</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-[160px] sm:w-[200px] h-[240px] sm:h-[300px] bg-zinc-900 rounded-lg animate-pulse shrink-0 border border-zinc-800" />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-6">Movies</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
              {movies.length > 0 ? (
                movies.map((movie) => (
                  <MediaCard key={movie.id} media={movie} />
                ))
              ) : (
                <p className="text-zinc-500 italic py-4">No movies found.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">TV Shows</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
              {shows.length > 0 ? (
                shows.map((show) => (
                  <MediaCard key={show.id} media={show} />
                ))
              ) : (
                <p className="text-zinc-500 italic py-4">No TV shows found.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
