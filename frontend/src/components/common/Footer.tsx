import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand & Description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <Film className="h-6 w-6 text-zinc-100 group-hover:text-white transition-colors" />
              <span className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                FilmedIn
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Your cinematic identity. Track what you watch, share your thoughts, and discover your next favorite movie or TV show.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/tanmayhutt/FilmedIn" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">
                GitHub
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-4 tracking-wider uppercase">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-zinc-500 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/explore?type=movie" className="text-sm text-zinc-500 hover:text-white transition-colors">Movies</Link></li>
              <li><Link to="/explore?type=tv" className="text-sm text-zinc-500 hover:text-white transition-colors">TV Shows</Link></li>
              <li><Link to="/studios" className="text-sm text-zinc-500 hover:text-white transition-colors">Studios & Networks</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-4 tracking-wider uppercase">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-zinc-500 hover:text-white transition-colors">About Us</Link></li>
              <li><a href="https://github.com/tanmayhutt/FilmedIn" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-white transition-colors">Open Source</a></li>
            </ul>
          </div>

          {/* TMDB Credit */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-4 tracking-wider uppercase">Data Source</h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              All movie, TV show, and actor metadata is provided by TMDB. FilmedIn uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              alt="TMDB Logo"
              className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all"
            />
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} FilmedIn. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
