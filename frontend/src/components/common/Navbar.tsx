import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NavbarProfile } from './NavbarProfile';
import { Logo } from './Logo';
import { ChevronDown, Film, Tv, Search, Star } from 'lucide-react';
import { searchMedia, TMDBMovie, TMDBTVShow } from '@/services/tmdb.service';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<'movies' | 'tv' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaResults, setMediaResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
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
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setActiveDropdown(null);
    setIsSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!searchQuery.trim()) { 
      setMediaResults([]); 
      setIsSearchOpen(false); 
      return; 
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchMedia(searchQuery);
        setMediaResults(data.slice(0, 5));
        setIsSearchOpen(true);
      } catch (e) { 
        console.error(e); 
      } finally { 
        setSearching(false); 
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="w-full bg-[#444b58]/90 backdrop-blur-xl sticky top-0 z-50 p-2 sm:p-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between clay-navbar rounded-full border border-white/10 bg-[#1b1b22]/90 shadow-2xl">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2" ref={dropdownRef}>
            <Link
              to="/"
              className={`text-xs font-bold transition-all px-4 py-2 rounded-full ${
                isHome ? 'bg-[#9062aa] text-white shadow-md scale-105' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>

            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'movies' ? null : 'movies')}
                className={`text-xs font-bold transition-all px-4 py-2 rounded-full flex items-center gap-1.5 focus:outline-none ${
                  isActiveMovie ? 'bg-[#9062aa] text-white shadow-md scale-105' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Movies
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'movies' ? 'rotate-180 text-white' : 'text-zinc-500'}`} />
              </button>
              {activeDropdown === 'movies' && (
                <div className="absolute top-full -left-12 pt-4 w-[500px] z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="clay-modal p-6">
                    
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10/50">
                      <div>
                        <h3 className="text-base font-semibold text-white">Movies</h3>
                        <p className="text-xs text-zinc-500 mt-1">Discover blockbusters, indies, and classics.</p>
                      </div>
                      <Link
                        to="/explore?type=movie&sort=popular"
                        className="px-4 py-2 text-xs font-medium clay-button-secondary transition-colors"
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
                          className="text-sm text-zinc-400 hover:text-white hover:bg-[var(--theme-dark)]/50 px-2 py-1.5 rounded-md transition-colors -ml-2"
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
                className={`text-xs font-bold transition-all px-4 py-2 rounded-full flex items-center gap-1.5 focus:outline-none ${
                  isActiveTV ? 'bg-[#9062aa] text-white shadow-md scale-105' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                TV Shows
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'tv' ? 'rotate-180 text-white' : 'text-zinc-500'}`} />
              </button>
              {activeDropdown === 'tv' && (
                <div className="absolute top-full -left-12 pt-4 w-[500px] z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="clay-modal p-6">
                    
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10/50">
                      <div>
                        <h3 className="text-base font-semibold text-white">TV Shows</h3>
                        <p className="text-xs text-zinc-500 mt-1">Binge-worthy dramas, comedies, and more.</p>
                      </div>
                      <Link
                        to="/explore?type=tv&sort=popular"
                        className="px-4 py-2 text-xs font-medium clay-button-secondary transition-colors"
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
                          className="text-sm text-zinc-400 hover:text-white hover:bg-[var(--theme-dark)]/50 px-2 py-1.5 rounded-md transition-colors -ml-2"
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
              className={`text-xs font-bold transition-all px-4 py-2 rounded-full ${
                isActiveStudio ? 'bg-[#9062aa] text-white shadow-md scale-105' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Studios
            </Link>

            <Link
              to="/about"
              className={`text-xs font-bold transition-all px-4 py-2 rounded-full ${
                isActiveAbout ? 'bg-[#9062aa] text-white shadow-md scale-105' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              About
            </Link>
          </div>
        </div>

        {/* Right: Title Search + Profile */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="hidden lg:block relative" ref={searchDropdownRef}>
            <form onSubmit={handleSearchSubmit} className="relative group w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-white transition-colors z-10">
                <Search className="h-3.5 w-3.5" />
              </div>
              <Input
                type="text"
                placeholder="Search movies & shows..."
                className="w-full h-9 pl-9 pr-3 bg-[var(--theme-dark)]/80 hover:bg-[var(--theme-dark)] focus:bg-[var(--theme-dark)] text-xs text-zinc-200 placeholder:text-zinc-500 rounded-full border border-white/10 focus:border-white/20 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && mediaResults.length > 0 && setIsSearchOpen(true)}
              />
            </form>

            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-80 clay-modal overflow-hidden z-50 p-2 animate-in fade-in slide-in-from-top-2">
                {searching ? (
                  <div className="px-4 py-3 text-zinc-500 text-xs">Searching titles...</div>
                ) : mediaResults.length > 0 ? (
                  <>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Titles</div>
                    {mediaResults.map(item => (
                      <button 
                        key={item.id} 
                        onClick={() => { 
                          setIsSearchOpen(false); 
                          setSearchQuery(''); 
                          if (item.media_type === 'movie') navigate(`/movie/${item.id}`)
                          else navigate(`/tv/${item.id}`)
                        }}
                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors text-left rounded-xl group/item"
                      >
                        <div className="w-8 h-11 clay-poster overflow-hidden shrink-0">
                          {item.poster_path
                            ? <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="poster" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-[#1b1b22]">{item.media_type === 'movie' ? <Film size={12} /> : <Tv size={12} />}</div>
                          }
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                          <span className="text-zinc-200 text-xs font-semibold truncate group-hover/item:text-white transition-colors">
                            {item.media_type === 'movie' ? (item as TMDBMovie).title : (item as TMDBTVShow).name}
                          </span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            {item.media_type === 'movie' ? 'Movie' : 'TV Show'} • {(item.media_type === 'movie' ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date)?.substring(0, 4)}
                          </span>
                        </div>
                        {item.vote_average > 0 && (
                          <span className="px-2 py-0.5 clay-badge-emerald text-[10px] font-bold shrink-0 inline-flex items-center gap-1">
                            <Star size={10} aria-hidden="true" /> {item.vote_average.toFixed(1)}
                          </span>
                        )}
                      </button>
                    ))}
                    <button onClick={handleSearchSubmit} className="w-full px-3 py-2 text-left text-[11px] font-semibold text-rose-400 hover:bg-white/5 transition-colors flex items-center gap-2 rounded-xl mt-1">
                      <Search size={10} /> View all title results for <span className="text-white">"{searchQuery}"</span>
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-3 text-zinc-500 text-xs">No titles found.</div>
                )}
              </div>
            )}
          </div>

          <NavbarProfile />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-white/10/50 bg-[var(--theme-bg)]/95 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex px-4 py-2 gap-3">
          <Link to="/search" className="text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full text-zinc-200 bg-[var(--theme-dark)] hover:bg-[var(--theme-dark-hover)] inline-flex items-center gap-1.5">
            <Search size={13} aria-hidden="true" /> Search
          </Link>
          <Link to="/" className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${isHome ? 'bg-white text-black' : 'text-zinc-400 bg-[var(--theme-dark)] hover:bg-[var(--theme-dark-hover)]'}`}>Home</Link>
          <Link to="/explore?type=movie&sort=popular" className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${isActiveMovie ? 'bg-white text-black' : 'text-zinc-400 bg-[var(--theme-dark)] hover:bg-[var(--theme-dark-hover)]'}`}>Movies</Link>
          <Link to="/explore?type=tv&sort=popular" className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${isActiveTV ? 'bg-white text-black' : 'text-zinc-400 bg-[var(--theme-dark)] hover:bg-[var(--theme-dark-hover)]'}`}>TV Shows</Link>
          <Link to="/studios" className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${isActiveStudio ? 'bg-white text-black' : 'text-zinc-400 bg-[var(--theme-dark)] hover:bg-[var(--theme-dark-hover)]'}`}>Studios</Link>
          <Link to="/about" className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${isActiveAbout ? 'bg-white text-black' : 'text-zinc-400 bg-[var(--theme-dark)] hover:bg-[var(--theme-dark-hover)]'}`}>About</Link>
        </div>
      </div>
    </nav>
  );
}
