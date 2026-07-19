import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavbarProfile } from './NavbarProfile';
import { Logo } from './Logo';
import { ChevronDown } from 'lucide-react';

export function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<'movies' | 'tv' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const isHome = location.pathname === '/';

  const searchParams = new URLSearchParams(location.search);
  const currentType = searchParams.get('type');
  const isActiveMovie = (location.pathname === '/explore' && currentType === 'movie') || location.pathname.startsWith('/movie/');
  const isActiveTV = (location.pathname === '/explore' && currentType === 'tv') || location.pathname.startsWith('/tv/');
  const isActiveStudio = location.pathname === '/studios' || location.pathname.startsWith('/studio/');
  const isActiveAbout = location.pathname === '/about';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname, location.search]);

  return (
    <nav className="w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2" ref={dropdownRef}>
            <Link
              to="/"
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${
                isHome ? 'text-white bg-zinc-800/60' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              Home
            </Link>

            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'movies' ? null : 'movies')}
                className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md flex items-center gap-1.5 focus:outline-none ${
                  isActiveMovie ? 'text-white bg-zinc-800/60' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                Movies
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'movies' ? 'rotate-180 text-white' : 'text-zinc-500'}`} />
              </button>
              {activeDropdown === 'movies' && (
                <div className="absolute top-full -left-12 pt-4 w-[500px] z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl shadow-2xl p-6">
                    
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/50">
                      <div>
                        <h3 className="text-base font-semibold text-white">Movies</h3>
                        <p className="text-xs text-zinc-500 mt-1">Discover blockbusters, indies, and classics.</p>
                      </div>
                      <Link
                        to="/explore?type=movie&sort=popular"
                        className="px-4 py-2 text-xs font-medium text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        All Movies &rarr;
                      </Link>
                    </div>

                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Browse by Genre</div>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                      {[
                        { id: 28, name: 'Action' },
                        { id: 12, name: 'Adventure' },
                        { id: 16, name: 'Animation' },
                        { id: 35, name: 'Comedy' },
                        { id: 80, name: 'Crime' },
                        { id: 99, name: 'Documentary' },
                        { id: 18, name: 'Drama' },
                        { id: 10751, name: 'Family' },
                        { id: 14, name: 'Fantasy' },
                        { id: 36, name: 'History' },
                        { id: 27, name: 'Horror' },
                        { id: 10402, name: 'Music' },
                        { id: 9648, name: 'Mystery' },
                        { id: 10749, name: 'Romance' },
                        { id: 878, name: 'Sci-Fi' },
                        { id: 53, name: 'Thriller' },
                        { id: 10752, name: 'War' },
                        { id: 37, name: 'Western' }
                      ].map(genre => (
                        <Link
                          key={genre.id}
                          to={`/explore?type=movie&genre=${genre.id}`}
                          className="text-sm text-zinc-400 hover:text-white hover:bg-zinc-900/50 px-2 py-1.5 rounded-md transition-colors -ml-2"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'tv' ? null : 'tv')}
                className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md flex items-center gap-1.5 focus:outline-none ${
                  isActiveTV ? 'text-white bg-zinc-800/60' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                TV Shows
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'tv' ? 'rotate-180 text-white' : 'text-zinc-500'}`} />
              </button>
              {activeDropdown === 'tv' && (
                <div className="absolute top-full -left-12 pt-4 w-[500px] z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl shadow-2xl p-6">
                    
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/50">
                      <div>
                        <h3 className="text-base font-semibold text-white">TV Shows</h3>
                        <p className="text-xs text-zinc-500 mt-1">Binge-worthy dramas, comedies, and more.</p>
                      </div>
                      <Link
                        to="/explore?type=tv&sort=popular"
                        className="px-4 py-2 text-xs font-medium text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        All TV Shows &rarr;
                      </Link>
                    </div>

                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Browse by Genre</div>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                      {[
                        { id: 10759, name: 'Action & Adventure' },
                        { id: 16, name: 'Animation' },
                        { id: 35, name: 'Comedy' },
                        { id: 80, name: 'Crime' },
                        { id: 99, name: 'Documentary' },
                        { id: 18, name: 'Drama' },
                        { id: 10751, name: 'Family' },
                        { id: 10762, name: 'Kids' },
                        { id: 9648, name: 'Mystery' },
                        { id: 10763, name: 'News' },
                        { id: 10764, name: 'Reality' },
                        { id: 10765, name: 'Sci-Fi & Fantasy' },
                        { id: 10766, name: 'Soap' },
                        { id: 10767, name: 'Talk' },
                        { id: 10768, name: 'War & Politics' },
                        { id: 37, name: 'Western' }
                      ].map(genre => (
                        <Link
                          key={genre.id}
                          to={`/explore?type=tv&genre=${genre.id}`}
                          className="text-sm text-zinc-400 hover:text-white hover:bg-zinc-900/50 px-2 py-1.5 rounded-md transition-colors -ml-2"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/studios"
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${
                isActiveStudio ? 'text-white bg-zinc-800/60' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              Studios & Networks
            </Link>

            <Link
              to="/about"
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${
                isActiveAbout ? 'text-white bg-zinc-800/60' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              About
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
          <Link to="/about" className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${isActiveAbout ? 'bg-white text-black' : 'text-zinc-400 bg-zinc-900 hover:bg-zinc-800'}`}>About</Link>
        </div>
      </div>
    </nav>
  );
}
