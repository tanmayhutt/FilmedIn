import { Link, useLocation } from 'react-router-dom'
import { Building2, ChevronDown, Compass, Film, Home, Info, Library, Menu, PanelLeftClose, Search, Tv } from 'lucide-react'
import { Logo } from './Logo'
import { NavbarProfile } from './NavbarProfile'
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

export function Navbar({ sidebarOpen, onToggleSidebar }: { sidebarOpen: boolean; onToggleSidebar: () => void }) {
  const location = useLocation()
  const isProfileRoute = location.pathname === '/profile' || location.pathname.startsWith('/u/')

  const isActive = (to: string) => {
    const type = new URLSearchParams(location.search).get('type')
    if (to === '/') return location.pathname === '/'
    if (to === '/profile') return location.pathname === '/profile' || location.pathname.startsWith('/profile/')
    if (to.startsWith('/explore?type=movie')) return location.pathname.startsWith('/movie/') || (location.pathname === '/explore' && type === 'movie')
    if (to.startsWith('/explore?type=tv')) return location.pathname.startsWith('/tv/') || (location.pathname === '/explore' && type === 'tv')
    if (to === '/explore') return location.pathname === '/explore' && !type
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
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
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Open navigation"
        aria-controls="desktop-sidebar"
        aria-expanded={sidebarOpen}
        title="Open navigation"
        className={`fixed left-4 top-4 z-50 hidden h-11 w-11 items-center justify-center rounded-xl border border-white/[0.09] bg-[#171817]/95 text-zinc-300 shadow-xl backdrop-blur-xl transition-all hover:border-white/[0.16] hover:bg-[#20211f] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2b48c] lg:inline-flex ${sidebarOpen ? 'pointer-events-none -translate-x-3 opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <aside id="desktop-sidebar" aria-hidden={!sidebarOpen} className={`scrollbar-hide fixed inset-y-0 left-0 z-50 hidden w-[280px] overflow-y-auto border-r border-white/[0.07] bg-[#111210]/97 p-5 backdrop-blur-2xl transition-[transform,visibility] duration-200 lg:flex lg:flex-col ${sidebarOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}>
        <div className="px-2 py-2">
          <div className="flex items-center justify-between gap-3">
            <Logo />
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Hide navigation"
              aria-controls="desktop-sidebar"
              aria-expanded={sidebarOpen}
              title="Hide navigation"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2b48c]"
            >
              <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-[11px] font-medium tracking-wide text-zinc-600">YOUR CINEMATIC IDENTITY</p>
        </div>

        <nav aria-label="Primary navigation" className="mt-8 space-y-1">{primaryNavigation.map(navigationLink)}</nav>
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
        </div>
      </aside>

      {!isProfileRoute && (
        <div className="fixed right-5 top-4 z-50 hidden rounded-2xl border border-white/[0.08] bg-[#171817]/95 p-2 shadow-xl backdrop-blur-xl lg:block">
          <NavbarProfile showLibraryLink={false} showLogout />
        </div>
      )}

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
