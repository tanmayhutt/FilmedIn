import { useState, useEffect, useRef } from 'react'
import { Search, Film, Tv, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { TrendingMovies, TrendingTV } from '@/components/features/TrendingMedia'
import { GenreRow } from '@/components/features/GenreRow'
import { HeroCarousel } from '@/components/features/HeroCarousel'
import { useNavigate, Link } from 'react-router-dom'
import { searchMedia, TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'
import { STUDIOS } from '@/lib/studios'

// ── Section divider ─────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-5 py-2">
      <div className="flex-1 h-px bg-zinc-800/80" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600 shrink-0">{label}</span>
      <div className="flex-1 h-px bg-zinc-800/80" />
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<(TMDBMovie | TMDBTVShow)[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); setIsDropdownOpen(false); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await searchMedia(query)
        setResults(data.slice(0, 6))
        setIsDropdownOpen(true)
      } catch (e) { console.error(e) }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) { setIsDropdownOpen(false); navigate(`/search?q=${encodeURIComponent(query)}`) }
  }

  const handleResultClick = (item: TMDBMovie | TMDBTVShow) => {
    setIsDropdownOpen(false); setQuery('')
    if (item.media_type === 'movie') navigate(`/movie/${item.id}`)
    else navigate(`/tv/${item.id}`)
  }

  return (
    <div className="min-h-screen pb-20">
      <HeroCarousel />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12">
        {/* Search bar */}
        <div className="w-full max-w-3xl mx-auto relative mb-16" ref={dropdownRef}>
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-zinc-300 transition-colors z-10">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Search titles..."
              className="w-full h-14 pl-12 pr-4 bg-zinc-900/80 border border-zinc-800 text-base rounded-full shadow-2xl focus-visible:ring-1 focus-visible:ring-zinc-600 focus-visible:border-zinc-700 transition-all placeholder:text-zinc-700 hover:bg-zinc-900 hover:border-zinc-700"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && results.length > 0 && setIsDropdownOpen(true)}
            />
          </form>

          {isDropdownOpen && query.trim().length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-150">
              {searching ? (
                <div className="px-4 py-4 text-zinc-600 text-sm">Searching...</div>
              ) : results.length > 0 ? (
                <>
                  {results.map(item => (
                    <button key={item.id} onClick={() => handleResultClick(item)}
                      className="w-full px-4 py-3 flex items-center gap-4 hover:bg-zinc-900 transition-colors text-left group/item border-b border-zinc-900 last:border-0">
                      <div className="w-9 h-[52px] bg-zinc-900 rounded-md overflow-hidden shrink-0 border border-zinc-800">
                        {item.poster_path
                          ? <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="poster" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-zinc-700">{item.media_type === 'movie' ? <Film size={14} /> : <Tv size={14} />}</div>
                        }
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className="text-zinc-200 text-sm font-medium truncate group-hover/item:text-white transition-colors">
                          {item.media_type === 'movie' ? (item as TMDBMovie).title : (item as TMDBTVShow).name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{item.media_type === 'movie' ? 'Movie' : 'TV'}</span>
                          <span className="text-[10px] text-zinc-700">
                            {(item.media_type === 'movie' ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date)?.substring(0, 4)}
                          </span>
                        </div>
                      </div>
                      {item.vote_average > 0 && <span className="text-[11px] font-semibold text-zinc-500 tabular-nums shrink-0">{item.vote_average.toFixed(1)}</span>}
                    </button>
                  ))}
                  <button onClick={handleSearch} className="w-full px-4 py-3 text-left text-xs font-medium text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 transition-colors flex items-center gap-2">
                    <Search size={11} /> View all results for <span className="text-zinc-400">"{query}"</span>
                  </button>
                </>
              ) : (
                <div className="px-4 py-4 text-zinc-600 text-sm">No results found.</div>
              )}
            </div>
          )}
        </div>
        {/* ── Content ── */}
        <div className="space-y-16">

          {/* MOVIES */}
          <section className="space-y-10">
            <SectionLabel label="Movies" />
            <div>
              <div className="flex items-center gap-3 mb-5"><div className="w-[3px] h-5 bg-white rounded-full" /><h2 className="text-xl font-bold text-zinc-100">Trending Movies</h2></div>
              <TrendingMovies />
            </div>
            
            <GenreRow title="Action & Adventure" genreId={28} type="movie" />
            <GenreRow title="Comedies" genreId={35} type="movie" />
          </section>

          {/* TV SHOWS */}
          <section className="space-y-10">
            <SectionLabel label="TV Shows" />
            <div>
              <div className="flex items-center gap-3 mb-5"><div className="w-[3px] h-5 bg-white rounded-full" /><h2 className="text-xl font-bold text-zinc-100">Trending TV Shows</h2></div>
              <TrendingTV />
            </div>
            
            <GenreRow title="Sci-Fi & Fantasy" genreId={10765} type="tv" />
            <GenreRow title="Dramas" genreId={18} type="tv" />
          </section>

        </div>
      </main>
    </div>
  )
}
