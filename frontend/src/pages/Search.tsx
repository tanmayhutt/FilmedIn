import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchMedia, TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'
import { searchUsers } from '@/services/public.service'
import { MediaCard } from '@/components/features/MediaCard'
import { Link } from 'react-router-dom'
import { User, Search as SearchIcon } from 'lucide-react'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const userQuery = searchParams.get('u') || ''
  
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [shows, setShows] = useState<TMDBTVShow[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query && !userQuery) {
      setMovies([])
      setShows([])
      setUsers([])
      setLoading(false)
      return
    }

    setLoading(true)
    const promises = []
    
    if (query) {
      promises.push(
        searchMedia(query).then(results => {
          setMovies(results.filter(item => item.media_type === 'movie') as TMDBMovie[])
          setShows(results.filter(item => item.media_type === 'tv') as TMDBTVShow[])
        })
      )
    } else {
      setMovies([])
      setShows([])
    }

    if (userQuery) {
      promises.push(
        searchUsers(userQuery).then(userResults => {
          setUsers(userResults)
        })
      )
    } else {
      setUsers([])
    }

    Promise.all(promises).then(() => setLoading(false)).catch(e => {
      console.error(e)
      setLoading(false)
    })
  }, [query, userQuery])

  if (!query && !userQuery) {
    return (
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl font-bold mb-8">Search</h1>
        <p className="text-zinc-400">Enter a search term above.</p>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in">
      <h1 className="text-3xl font-bold mb-8">Search results for {query ? `"${query}"` : ''} {userQuery ? `"${userQuery}" (Users)` : ''}</h1>

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
          {query && (
            <>
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
            </>
          )}

          {users.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Users</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {users.map(user => (
                  <Link key={user._id} to={`/u/${user.username}`} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-800 transition-colors group">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-zinc-800">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{user.username}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
