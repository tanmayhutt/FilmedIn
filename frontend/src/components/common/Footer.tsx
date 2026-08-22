import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
      <div className="clay-card p-10 sm:p-14 relative overflow-hidden">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand & Description */}
          <div className="md:col-span-1 space-y-4">
            <Logo />
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your cinematic identity. Keep movies and TV together, organise your viewing journey, and share the collection that feels like you.
            </p>
            <div>
              <a href="https://github.com/tanmayhutt/FilmedIn" target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-all">
                GitHub Repository
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white mb-4 tracking-wider uppercase">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/profile" className="text-sm text-zinc-400 hover:text-white transition-colors">My Library</Link></li>
              <li><Link to="/explore?type=movie" className="text-sm text-zinc-400 hover:text-white transition-colors">Movies</Link></li>
              <li><Link to="/explore?type=tv" className="text-sm text-zinc-400 hover:text-white transition-colors">TV Shows</Link></li>
              <li><Link to="/studios" className="text-sm text-zinc-400 hover:text-white transition-colors">Studios & Networks</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-bold text-white mb-4 tracking-wider uppercase">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-zinc-400 hover:text-white transition-colors">About Us</Link></li>
              <li><a href="https://github.com/tanmayhutt/FilmedIn" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors">Open Source</a></li>
            </ul>
          </div>

          {/* TMDB Credit */}
          <div>
            <h3 className="text-xs font-bold text-white mb-4 tracking-wider uppercase">Data Source</h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              All movie, TV show, and actor metadata is provided by TMDB. FilmedIn uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              alt="TMDB Logo"
              className="h-4 opacity-75"
            />
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} FilmedIn. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-zinc-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

    </footer>
  )
}
