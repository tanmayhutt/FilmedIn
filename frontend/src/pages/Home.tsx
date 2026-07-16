import { useState, useEffect, useRef } from 'react'
import { Search, Film, Tv, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { TrendingMovies, TrendingTV } from '@/components/features/TrendingMedia'
import { useNavigate } from 'react-router-dom'
import { searchMedia, TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<(TMDBMovie | TMDBTVShow)[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Close dropdown if clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsDropdownOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchMedia(query)
        setResults(data.slice(0, 5)) // show top 5 recommendations
        setIsDropdownOpen(true)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsDropdownOpen(false)
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleResultClick = (item: TMDBMovie | TMDBTVShow) => {
    setIsDropdownOpen(false)
    if (item.media_type === 'movie') {
      navigate(`/movie/${item.id}`)
    } else {
      navigate(`/tv/${item.id}`)
    }
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col items-center justify-center space-y-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 mt-12 sm:mt-24">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-center bg-gradient-to-br from-white to-zinc-500 text-transparent bg-clip-text">
          What are you watching?
        </h1>
        <p className="text-zinc-400 text-lg sm:text-xl text-center max-w-2xl">
          Search for movies and TV shows, build your minimalist playlist, and track your cinematic journey.
        </p>

        <div className="w-full max-w-2xl relative" ref={dropdownRef}>
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors z-10">
              <Search className="h-5 w-5" />
            </div>
            <Input 
              type="text" 
              placeholder="Search for titles..." 
              className="w-full h-14 pl-12 pr-4 bg-zinc-900 border-zinc-800 text-lg rounded-full shadow-2xl focus-visible:ring-1 focus-visible:ring-zinc-600 transition-all placeholder:text-zinc-600 hover:bg-zinc-800/80 relative z-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && results.length > 0 && setIsDropdownOpen(true)}
            />
          </form>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (query.trim().length > 0) && (
            <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col py-2 animate-in slide-in-from-top-2 fade-in duration-200">
              {loading ? (
                <div className="px-4 py-3 text-zinc-500 text-sm">Searching...</div>
              ) : results.length > 0 ? (
                <>
                  {results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleResultClick(item)}
                      className="w-full px-4 py-3 flex items-center gap-4 hover:bg-zinc-800 transition-colors text-left group"
                    >
                      <div className="w-10 h-14 bg-zinc-950 rounded overflow-hidden shrink-0">
                        {item.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="poster" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            {item.media_type === 'movie' ? <Film size={16} /> : <Tv size={16} />}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className="text-zinc-100 font-medium truncate group-hover:text-white transition-colors">
                          {item.media_type === 'movie' ? (item as TMDBMovie).title : (item as TMDBTVShow).name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                          <span className="uppercase tracking-wider font-semibold text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                            {item.media_type}
                          </span>
                          <span>
                            {(item.media_type === 'movie' ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date)?.substring(0, 4)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className="px-4 pt-3 pb-1 border-t border-zinc-800/50 mt-2">
                    <button onClick={handleSearch} className="text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                      <Search size={12} /> View all results for "{query}"
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-3 text-zinc-500 text-sm">No results found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-2xl font-semibold tracking-tight">Trending Movies</h2>
          </div>
          <TrendingMovies />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-2xl font-semibold tracking-tight">Trending TV Shows</h2>
          </div>
          <TrendingTV />
        </section>
      </div>
    </main>
  )
}
