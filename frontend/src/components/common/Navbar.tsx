import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { NavbarProfile } from './NavbarProfile';
import { Logo } from './Logo';
import { ChevronDown } from 'lucide-react';

// TMDB genres are static - no need to fetch them
const MOVIE_GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' }, { id: 36, name: 'History' },
  { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' }, { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' }, { id: 37, name: 'Western' },
];

const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' }, { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' }, { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' }, { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' }, { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10767, name: 'Talk' }, { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

interface NavDropdownProps {
  label: string;
  type: 'movie' | 'tv';
  genres: { id: number; name: string }[];
}

function NavDropdown({ label, type, genres }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const go = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 outline-none cursor-pointer"
      >
        {label}
        <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[100] overflow-hidden">
          {/* Explore section */}
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Explore</p>
            <button onClick={() => go(`/explore?type=${type}&sort=popular`)} className="w-full text-left text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 px-2 py-1.5 rounded-lg transition-colors">
              Popular
            </button>
            <button onClick={() => go(`/explore?type=${type}&sort=top_rated`)} className="w-full text-left text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 px-2 py-1.5 rounded-lg transition-colors">
              Top Rated
            </button>
          </div>

          <div className="h-px bg-zinc-800 mx-3 my-2" />

          {/* Genres section */}
          <div className="px-3 pb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Genres</p>
            <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => go(`/explore?type=${type}&genre=${genre.id}`)}
                  className="text-left text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 px-2 py-1.5 rounded-lg transition-colors truncate"
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

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

            <NavDropdown label="Movies" type="movie" genres={MOVIE_GENRES} />
            <NavDropdown label="TV Shows" type="tv" genres={TV_GENRES} />

            <Link
              to="/studios"
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${
                location.pathname === '/studios' ? 'text-white bg-zinc-800/60' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
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
          <Link to="/explore?type=movie&sort=popular" className="text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full text-zinc-400 bg-zinc-900 hover:bg-zinc-800">Movies</Link>
          <Link to="/explore?type=tv&sort=popular" className="text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full text-zinc-400 bg-zinc-900 hover:bg-zinc-800">TV Shows</Link>
          <Link to="/studios" className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${location.pathname === '/studios' ? 'bg-white text-black' : 'text-zinc-400 bg-zinc-900 hover:bg-zinc-800'}`}>Studios</Link>
        </div>
      </div>
    </nav>
  );
}
