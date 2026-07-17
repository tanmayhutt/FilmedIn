import { Link, useLocation } from 'react-router-dom';
import { NavbarProfile } from './NavbarProfile';
import { Logo } from './Logo';
export function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const searchParams = new URLSearchParams(location.search);
  const currentType = searchParams.get('type');
  const isActiveMovie = (location.pathname === '/explore' && currentType === 'movie') || location.pathname.startsWith('/movie/');
  const isActiveTV = (location.pathname === '/explore' && currentType === 'tv') || location.pathname.startsWith('/tv/');
  const isActiveStudio = location.pathname === '/studios' || location.pathname.startsWith('/studio/');

  return (
    <nav className="w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${
                isHome ? 'text-white bg-zinc-800/60' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/explore?type=movie&sort=popular"
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${
                isActiveMovie ? 'text-white bg-zinc-800/60' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              Movies
            </Link>

            <Link
              to="/explore?type=tv&sort=popular"
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${
                isActiveTV ? 'text-white bg-zinc-800/60' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              TV Shows
            </Link>

            <Link
              to="/studios"
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${
                isActiveStudio ? 'text-white bg-zinc-800/60' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              Studios & Networks
            </Link>
          </div>
        </div>

        {/* Right: Auth/Profile */}
        <div className="flex items-center gap-4">
          <NavbarProfile />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-zinc-800/50 bg-zinc-950/95 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex px-4 py-2 gap-3">
          <Link to="/" className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${isHome ? 'bg-white text-black' : 'text-zinc-400 bg-zinc-900 hover:bg-zinc-800'}`}>Home</Link>
          <Link to="/explore?type=movie&sort=popular" className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${isActiveMovie ? 'bg-white text-black' : 'text-zinc-400 bg-zinc-900 hover:bg-zinc-800'}`}>Movies</Link>
          <Link to="/explore?type=tv&sort=popular" className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${isActiveTV ? 'bg-white text-black' : 'text-zinc-400 bg-zinc-900 hover:bg-zinc-800'}`}>TV Shows</Link>
          <Link to="/studios" className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${isActiveStudio ? 'bg-white text-black' : 'text-zinc-400 bg-zinc-900 hover:bg-zinc-800'}`}>Studios</Link>
        </div>
      </div>
    </nav>
  );
}
