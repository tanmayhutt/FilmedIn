import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NavbarProfile } from './NavbarProfile';
import { Logo } from './Logo';
import { ChevronDown, User, Search } from 'lucide-react';
import { searchUsers } from '@/services/public.service';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<'movies' | 'tv' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);

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
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setActiveDropdown(null);
    setIsUserDropdownOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!userQuery.trim()) { setUserResults([]); setIsUserDropdownOpen(false); return; }
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const data = await searchUsers(userQuery);
        setUserResults(data.slice(0, 5));
        setIsUserDropdownOpen(true);
      } catch (e) { console.error(e); }
      finally { setSearchingUsers(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [userQuery]);

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (userQuery.trim()) { setIsUserDropdownOpen(false); navigate(`/search?u=${encodeURIComponent(userQuery)}`); }
  };

  return (
    <nav className="w-full bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 p-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between clay-navbar">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2" ref={dropdownRef}>
            <Link
              to="/"
              className={`text-sm font-medium transition-all px-3.5 py-1.5 rounded-full ${
                isHome ? 'clay-badge-blue' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              Home
            </Link>

            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'movies' ? null : 'movies')}
                className={`text-sm font-medium transition-all px-3.5 py-1.5 rounded-full flex items-center gap-1.5 focus:outline-none ${
                  isActiveMovie ? 'clay-badge-blue' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                Movies
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'movies' ? 'rotate-180 text-white' : 'text-zinc-500'}`} />
              </button>
              {activeDropdown === 'movies' && (
                <div className="absolute top-full -left-12 pt-4 w-[500px] z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="clay-modal p-6">
                    
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/50">
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
                className={`text-sm font-medium transition-all px-3.5 py-1.5 rounded-full flex items-center gap-1.5 focus:outline-none ${
                  isActiveTV ? 'clay-badge-blue' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                TV Shows
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'tv' ? 'rotate-180 text-white' : 'text-zinc-500'}`} />
              </button>
              {activeDropdown === 'tv' && (
                <div className="absolute top-full -left-12 pt-4 w-[500px] z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="clay-modal p-6">
                    
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/50">
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
              className={`text-sm font-medium transition-all px-3.5 py-1.5 rounded-full ${
                isActiveStudio ? 'clay-badge-blue' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              Studios & Networks
            </Link>

            <Link
              to="/about"
              className={`text-sm font-medium transition-all px-3.5 py-1.5 rounded-full ${
                isActiveAbout ? 'clay-badge-blue' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              About
            </Link>
          </div>
        </div>

        {/* Right: Auth/Profile */}
        <div className="flex items-center gap-4">
          {/* User Search */}
          <div className="hidden lg:block relative" ref={userDropdownRef}>
            <form onSubmit={handleUserSearch} className="relative group w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors z-10">
                <Search className="h-4 w-4" />
              </div>
              <Input
                type="text"
                placeholder="Search users..."
                className="w-full h-9 pl-9 pr-3 clay-input text-sm rounded-full placeholder:text-zinc-600 border-none"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onFocus={() => userQuery.trim() && userResults.length > 0 && setIsUserDropdownOpen(true)}
              />
            </form>

            {isUserDropdownOpen && userQuery.trim().length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-72 clay-modal overflow-hidden z-50 p-2 animate-in fade-in slide-in-from-top-2">
                {searchingUsers ? (
                  <div className="px-4 py-3 text-zinc-600 text-xs">Searching users...</div>
                ) : userResults.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-900/30">Users</div>
                    {userResults.map(user => (
                      <button key={user._id} onClick={() => { setIsUserDropdownOpen(false); setUserQuery(''); navigate(`/u/${user.username}`); }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-zinc-900 transition-colors text-left group/item border-b border-zinc-900 last:border-0">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full overflow-hidden shrink-0 border border-zinc-700">
                          {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-500"><User size={12} /></div>}
                        </div>
                        <span className="text-zinc-200 text-sm font-medium truncate group-hover/item:text-white transition-colors">{user.username}</span>
                      </button>
                    ))}
                    <button onClick={handleUserSearch} className="w-full px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 transition-colors flex items-center gap-2">
                      <Search size={10} /> View all user results for <span className="text-zinc-400">"{userQuery}"</span>
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-3 text-zinc-600 text-xs">No users found.</div>
                )}
              </div>
            )}
          </div>

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
