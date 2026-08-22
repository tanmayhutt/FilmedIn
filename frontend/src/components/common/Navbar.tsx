import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Building2, ChevronDown, Compass, Film, Home, Info, Library, Search, Star, Tv } from 'lucide-react'
import { Logo } from './Logo'
import { NavbarProfile } from './NavbarProfile'
import { searchMedia, TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'
import { Input } from '@/components/ui/input'

type SearchResult = TMDBMovie | TMDBTVShow
type NavigationItem = { label: string; to: string; icon: typeof Home }

const primaryNavigation: NavigationItem[] = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Explore', to: '/explore', icon: Compass },
  { label: 'My Library', to: '/profile', icon: Library },
]

const browseNavigation: NavigationItem[] = [
  { label: 'Studios', to: '/studios', icon: Building2 },
]

const browseGroups = [
  {
    label: 'Movies',
    icon: Film,
    type: 'movie',
    links: [
      { label: 'Popular', to: '/explore?type=movie&sort=popular' },
      { label: 'Top rated', to: '/explore?type=movie&sort=top_rated' },
      { label: 'Action', to: '/explore?type=movie&genre=28' },
      { label: 'Adventure', to: '/explore?type=movie&genre=12' },
      { label: 'Animation', to: '/explore?type=movie&genre=16' },
      { label: 'Comedy', to: '/explore?type=movie&genre=35' },
      { label: 'Crime', to: '/explore?type=movie&genre=80' },
      { label: 'Documentary', to: '/explore?type=movie&genre=99' },
      { label: 'Drama', to: '/explore?type=movie&genre=18' },
      { label: 'Family', to: '/explore?type=movie&genre=10751' },
      { label: 'Fantasy', to: '/explore?type=movie&genre=14' },
      { label: 'History', to: '/explore?type=movie&genre=36' },
      { label: 'Horror', to: '/explore?type=movie&genre=27' },
      { label: 'Music', to: '/explore?type=movie&genre=10402' },
      { label: 'Mystery', to: '/explore?type=movie&genre=9648' },
      { label: 'Romance', to: '/explore?type=movie&genre=10749' },
      { label: 'Science fiction', to: '/explore?type=movie&genre=878' },
      { label: 'Thriller', to: '/explore?type=movie&genre=53' },
      { label: 'War', to: '/explore?type=movie&genre=10752' },
      { label: 'Western', to: '/explore?type=movie&genre=37' },
    ],
  },
  {
    label: 'TV Shows',
    icon: Tv,
    type: 'tv',
    links: [
      { label: 'Popular', to: '/explore?type=tv&sort=popular' },
      { label: 'Top rated', to: '/explore?type=tv&sort=top_rated' },
      { label: 'Action & adventure', to: '/explore?type=tv&genre=10759' },
      { label: 'Animation', to: '/explore?type=tv&genre=16' },
      { label: 'Comedy', to: '/explore?type=tv&genre=35' },
      { label: 'Crime', to: '/explore?type=tv&genre=80' },
      { label: 'Documentary', to: '/explore?type=tv&genre=99' },
      { label: 'Drama', to: '/explore?type=tv&genre=18' },
      { label: 'Family', to: '/explore?type=tv&genre=10751' },
      { label: 'Kids', to: '/explore?type=tv&genre=10762' },
      { label: 'Mystery', to: '/explore?type=tv&genre=9648' },
      { label: 'News', to: '/explore?type=tv&genre=10763' },
      { label: 'Reality', to: '/explore?type=tv&genre=10764' },
      { label: 'Sci-fi & fantasy', to: '/explore?type=tv&genre=10765' },
      { label: 'Soap', to: '/explore?type=tv&genre=10766' },
      { label: 'Talk', to: '/explore?type=tv&genre=10767' },
      { label: 'War & politics', to: '/explore?type=tv&genre=10768' },
      { label: 'Western', to: '/explore?type=tv&genre=37' },
    ],
  },
]

function mediaTitle(item: SearchResult) {
  return item.media_type === 'movie' ? (item as TMDBMovie).title : (item as TMDBTVShow).name
}

function mediaYear(item: SearchResult) {
  const date = item.media_type === 'movie' ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date
  return date?.slice(0, 4)
}

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const isActive = (to: string) => {
    const type = new URLSearchParams(location.search).get('type')
    if (to === '/') return location.pathname === '/'
    if (to === '/profile') return location.pathname === '/profile' || location.pathname.startsWith('/profile/')
    if (to.startsWith('/explore?type=movie')) return location.pathname.startsWith('/movie/') || (location.pathname === '/explore' && type === 'movie')
    if (to.startsWith('/explore?type=tv')) return location.pathname.startsWith('/tv/') || (location.pathname === '/explore' && type === 'tv')
    if (to === '/explore') return location.pathname === '/explore' && !type
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  useEffect(() => setSearchOpen(false), [location.pathname, location.search])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSearchOpen(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setSearching(true)
      try {
        const data = await searchMedia(query)
        setResults(data.slice(0, 4))
        setSearchOpen(true)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (!query.trim()) return
    setSearchOpen(false)
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const navigationLink = ({ label, to, icon: Icon }: NavigationItem) => {
    const active = isActive(to)
    return (
      <Link
        key={label}
        to={to}
        aria-current={active ? 'page' : undefined}
        className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${active ? 'bg-[#e8e0d3] text-[#111210]' : 'text-zinc-400 hover:bg-white/[0.055] hover:text-white'}`}
      >
        <Icon className={`h-[18px] w-[18px] ${active ? 'text-[#111210]' : 'text-zinc-500 group-hover:text-zinc-200'}`} aria-hidden="true" />
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <>
      <aside className="scrollbar-hide fixed inset-y-0 left-0 z-50 hidden w-[280px] overflow-y-auto border-r border-white/[0.07] bg-[#111210]/97 p-5 backdrop-blur-2xl lg:flex lg:flex-col">
        <div className="px-2 py-2">
          <Logo />
          <p className="mt-2 text-[11px] font-medium tracking-wide text-zinc-600">YOUR CINEMATIC IDENTITY</p>
        </div>

        <div ref={searchRef} className="relative mt-7">
          <form onSubmit={submitSearch} className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => query.trim() && setSearchOpen(true)} aria-label="Search movies and TV shows" placeholder="Search titles" className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#d2b48c]/60" />
          </form>

          {searchOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#1a1b19] p-2 shadow-2xl">
              {searching ? (
                <p className="px-3 py-3 text-xs text-zinc-500">Searching titles...</p>
              ) : results.length ? (
                <>
                  {results.map((item) => (
                    <button key={`${item.media_type}-${item.id}`} type="button" onClick={() => { navigate(`/${item.media_type === 'movie' ? 'movie' : 'tv'}/${item.id}`); setQuery('') }} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.06]">
                      <div className="h-12 w-8 shrink-0 overflow-hidden rounded-lg bg-white/[0.05]">
                        {item.poster_path ? <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-zinc-600"><Film className="h-3.5 w-3.5" /></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-zinc-200">{mediaTitle(item)}</p>
                        <p className="mt-1 text-[10px] text-zinc-500">{item.media_type === 'movie' ? 'Movie' : 'TV Show'}{mediaYear(item) ? ` · ${mediaYear(item)}` : ''}</p>
                      </div>
                      {item.vote_average > 0 && <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500"><Star className="h-3 w-3" />{item.vote_average.toFixed(1)}</span>}
                    </button>
                  ))}
                  <button type="button" onClick={submitSearch} className="mt-1 w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#d2b48c] hover:bg-white/[0.06]">View every result</button>
                </>
              ) : <p className="px-3 py-3 text-xs text-zinc-500">No titles found.</p>}
            </div>
          )}
        </div>

        <nav aria-label="Primary navigation" className="mt-7 space-y-1">{primaryNavigation.map(navigationLink)}</nav>
        <div className="my-6 h-px bg-white/[0.07]" />
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">Browse</p>
        <nav aria-label="Browse" className="space-y-1">
          {browseGroups.map(({ label, icon: Icon, type, links }) => {
            const active = location.pathname.startsWith(`/${type}/`) || (location.pathname === '/explore' && new URLSearchParams(location.search).get('type') === type)
            return (
              <details key={type} className="group/nav" open={active || undefined}>
                <summary className={`flex cursor-pointer list-none items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors [&::-webkit-details-marker]:hidden ${active ? 'bg-white/[0.075] text-white' : 'text-zinc-400 hover:bg-white/[0.055] hover:text-white'}`}>
                  <Icon className="h-[18px] w-[18px] text-zinc-500" aria-hidden="true" />
                  <span>{label}</span>
                  <ChevronDown className="ml-auto h-4 w-4 text-zinc-600 transition-transform group-open/nav:rotate-180" aria-hidden="true" />
                </summary>
                <div className="mb-3 ml-[1.35rem] mt-1 grid grid-cols-2 border-l border-white/[0.08] pl-3">
                  {links.map((link) => {
                    const linkActive = `${location.pathname}${location.search}` === link.to
                    return <Link key={link.label} to={link.to} aria-current={linkActive ? 'page' : undefined} className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${linkActive ? 'bg-white/[0.07] text-white' : 'text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-200'}`}>{link.label}</Link>
                  })}
                </div>
              </details>
            )
          })}
          {browseNavigation.map(navigationLink)}
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          {navigationLink({ label: 'About', to: '/about', icon: Info })}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-2"><NavbarProfile showLibraryLink={false} /></div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#111210]/94 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between"><Logo /><NavbarProfile showLibraryLink={false} /></div>
      </header>

      <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[1.25rem] border border-white/10 bg-[#171817]/96 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:hidden">
        {[
          { label: 'Home', to: '/', icon: Home },
          { label: 'Search', to: '/search', icon: Search },
          { label: 'Library', to: '/profile', icon: Library },
          { label: 'Movies', to: '/explore?type=movie&sort=popular', icon: Film },
          { label: 'TV', to: '/explore?type=tv&sort=popular', icon: Tv },
        ].map(({ label, to, icon: Icon }) => {
          const active = isActive(to)
          return <Link key={label} to={to} aria-current={active ? 'page' : undefined} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[9px] font-semibold transition-colors ${active ? 'bg-[#e8e0d3] text-[#111210]' : 'text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200'}`}><Icon className="h-[18px] w-[18px]" aria-hidden="true" /><span className="truncate">{label}</span></Link>
        })}
      </nav>
    </>
  )
}
