import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchMedia, TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'
import { searchUsers } from '@/services/public.service'
import { UserAvatar } from '@/components/common/UserAvatar'
import { MediaCard } from '@/components/features/MediaCard'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Search as SearchIcon } from 'lucide-react'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const userQuery = searchParams.get('u') || ''
  
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [shows, setShows] = useState<TMDBTVShow[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState(query)

  useEffect(() => setSearchValue(query), [query])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const value = searchValue.trim()
    if (value) setSearchParams({ q: value })
  }

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

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in">
      <div className="clay-card p-6 sm:p-8 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 clay-badge-blue text-xs font-mono font-bold uppercase tracking-wider mb-2">
          Search Results
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Search FilmedIn</h1>
        <form onSubmit={handleSubmit} className="mt-6 flex gap-3" role="search">
          <label htmlFor="title-search" className="sr-only">Search movies and TV shows</label>
          <Input
            id="title-search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="clay-input h-12 flex-1"
            placeholder="Search movies and TV shows"
            autoComplete="off"
          />
          <button type="submit" disabled={!searchValue.trim()} aria-label="Search titles" className="clay-button-primary h-12 px-5 inline-flex items-center gap-2 disabled:opacity-50">
            <SearchIcon size={17} aria-hidden="true" /> <span className="hidden sm:inline">Search</span>
          </button>
        </form>
        {(query || userQuery) && (
          <p className="mt-4 text-sm text-zinc-300">Results for {query ? `“${query}”` : `member “${userQuery}”`}</p>
        )}
      </div>

      {!query && !userQuery && (
        <div className="clay-card p-10 text-center text-zinc-300">Search by title to find movies and TV shows.</div>
      )}

      {(query || userQuery) && (loading ? (
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-6 text-white">Movies</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-[160px] sm:w-[200px] h-[240px] sm:h-[300px] clay-card animate-pulse shrink-0" />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-12">
          {query && (
            <>
              <section>
                <h2 className="text-2xl font-bold mb-6 text-white">Movies</h2>
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
                  {movies.length > 0 ? (
                    movies.map((movie) => (
                      <MediaCard key={movie.id} media={movie} />
                    ))
                  ) : (
                    <p className="text-zinc-400 italic py-4">No movies found.</p>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 text-white">TV Shows</h2>
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
                  {shows.length > 0 ? (
                    shows.map((show) => (
                      <MediaCard key={show.id} media={show} />
                    ))
                  ) : (
                    <p className="text-zinc-400 italic py-4">No TV shows found.</p>
                  )}
                </div>
              </section>
            </>
          )}

          {users.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white">Users</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {users.map(user => (
                  <Link key={user._id} to={`/u/${user.username}`} className="flex items-center gap-4 clay-card p-5 group">
                    <UserAvatar avatarUrl={user.avatarUrl} username={user.username} className="w-12 h-12" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors">@{user.username}</div>
                      <div className="text-xs text-zinc-400 truncate">Cinephile Profile</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      ))}
    </main>
  )
}
