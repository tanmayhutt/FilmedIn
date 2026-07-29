import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { X } from 'lucide-react'

export function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  return (
    <footer className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
      <div className="clay-card p-10 sm:p-14 border border-white/10 rounded-[2.5rem] relative overflow-hidden">
        {/* Organic Wave Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#9062aa]" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand & Description */}
          <div className="md:col-span-1 space-y-4">
            <Logo />
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your cinematic identity. Track what you watch, share your thoughts, and discover your next favorite movie or TV show.
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
            <button onClick={() => setShowPrivacy(true)} className="text-xs text-zinc-400 hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => setShowTerms(true)} className="text-xs text-zinc-400 hover:text-white transition-colors">
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#1b1b22] border border-white/10 rounded-2xl max-w-lg w-full p-6 text-zinc-300 space-y-4 shadow-2xl relative">
            <button onClick={() => setShowPrivacy(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white">Privacy Policy</h3>
            <div className="text-xs space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>At FilmedIn, we prioritize your privacy. We store basic authentication information (such as your username, email address, and profile preferences) strictly to power your personal watchlist and social features.</p>
              <p>We do not sell, trade, or share your data with third parties. Media data is retrieved dynamically via TMDB APIs.</p>
              <p>If you choose to delete your account, all your profile data and watchlists are permanently erased from our servers.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} className="w-full py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#1b1b22] border border-white/10 rounded-2xl max-w-lg w-full p-6 text-zinc-300 space-y-4 shadow-2xl relative">
            <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white">Terms of Service</h3>
            <div className="text-xs space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>Welcome to FilmedIn. By using our platform, you agree to these terms.</p>
              <p>FilmedIn is designed for entertainment and personal watchlist tracking. Users are expected to maintain respectful behavior across social features and custom playlists.</p>
              <p>All movie and TV show logos, images, and metadata belong to their respective copyright holders and TMDB.</p>
            </div>
            <button onClick={() => setShowTerms(false)} className="w-full py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200">
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  )
}
