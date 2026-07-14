import { useEffect, useState } from 'react'
import { fetchTrendingMovies, fetchTrendingTV } from '@/services/tmdb.service'
import { MediaCard } from '@/components/features/MediaCard'

export function TrendingMovies() {
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingMovies().then(data => {
      setMovies(data)
      setLoading(false)
    }).catch(e => {
      console.error(e)
      setLoading(false)
    })
  }, [])

  if (loading) return <TrendingSkeleton />

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
  )
}

export function TrendingTV() {
  const [shows, setShows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingTV().then(data => {
      setShows(data)
      setLoading(false)
    }).catch(e => {
      console.error(e)
      setLoading(false)
    })
  }, [])

  if (loading) return <TrendingSkeleton />

  return (
    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
      {shows.length > 0 ? (
        shows.map((show: any) => (
          <MediaCard key={show.id} media={show} />
        ))
      ) : (
        <div className="text-zinc-500 text-sm italic py-4">No TV shows found. Please configure your TMDB API Key.</div>
      )}
    </div>
  )
}

export function TrendingSkeleton() {
  return (
    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-[160px] sm:w-[200px] h-[240px] sm:h-[300px] bg-zinc-900 rounded-lg animate-pulse shrink-0 border border-zinc-800" />
      ))}
    </div>
  )
}
