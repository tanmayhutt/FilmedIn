import { Film, Users, Shield, Zap, Globe, ArrowRight, Bookmark, CheckCircle2, Heart, Library } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <main className="flex-1 w-full flex flex-col pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col items-center text-center max-w-5xl mx-auto mt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 clay-badge-blue text-xs font-mono font-bold uppercase tracking-wider mb-8">
          <Film className="w-4 h-4" /> Introducing FilmedIn
        </div>
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-tight mb-8">
          Your Cinematic Identity, <br className="hidden sm:block" />
          <span className="text-[#d2b48c]">Perfectly Captured.</span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-300 max-w-3xl leading-relaxed mb-12 font-medium">
          What you watch becomes part of your story. FilmedIn is a focused social collection space where movies and television live together, organised around your own viewing journey.
        </p>
        <div className="flex items-center gap-5">
          <Link to="/" className="px-8 py-3.5 clay-button-primary text-sm flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="https://github.com/tanmayhutt/FilmedIn" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 clay-button-secondary text-sm">
            View Source
          </a>
        </div>
      </section>

      {/* Product pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="clay-card p-6 flex flex-col items-center text-center">
            <Library className="h-8 w-8 text-zinc-500 mb-4" aria-hidden="true" />
            <span className="text-sm font-bold text-white mb-1">Movies + TV</span>
            <span className="text-xs text-zinc-400">One unified library</span>
          </div>
          <div className="clay-card p-6 flex flex-col items-center text-center">
            <CheckCircle2 className="h-8 w-8 text-[#82ac62] mb-4" aria-hidden="true" />
            <span className="text-sm font-bold text-white mb-1">Viewing states</span>
            <span className="text-xs text-zinc-400">Next, watching, completed</span>
          </div>
          <div className="clay-card p-6 flex flex-col items-center text-center">
            <Bookmark className="h-8 w-8 text-[#7299c6] mb-4" aria-hidden="true" />
            <span className="text-sm font-bold text-white mb-1">Collections</span>
            <span className="text-xs text-zinc-400">Curate on your terms</span>
          </div>
          <div className="clay-card p-6 flex flex-col items-center text-center">
            <Heart className="h-8 w-8 text-[#b6789e] mb-4" aria-hidden="true" />
            <span className="text-sm font-bold text-white mb-1">Taste Blend</span>
            <span className="text-xs text-zinc-400">Find what connects you</span>
          </div>
        </div>
      </section>

      {/* The Story & Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">Built by film lovers, for film lovers.</h2>
            <div className="space-y-6 text-zinc-300 text-base sm:text-lg leading-relaxed">
              <p>
                The idea for FilmedIn started with a simple frustration: there was no elegant, unified place to track both the movies we were watching and the TV shows we were binging, while still making that collection personal and shareable.
              </p>
              <p>
                We set out to build a platform that feels calmer than a media database and broader than a movie-only diary. Your library stays central, with discovery and people around it rather than competing with it.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="clay-card p-6">
              <Shield className="w-8 h-8 text-zinc-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Ad-Free Experience</h3>
              <p className="text-sm text-zinc-400">Your cinematic identity shouldn't be interrupted by ads. We keep the UI clean and focused.</p>
            </div>
            <div className="clay-card p-6">
              <Zap className="w-8 h-8 text-zinc-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-sm text-zinc-400">Built on modern web technologies ensuring instant searches and snappy navigation.</p>
            </div>
            <div className="clay-card p-6">
              <Users className="w-8 h-8 text-zinc-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Community First</h3>
              <p className="text-sm text-zinc-400">Connect with friends, share playlists, and discover niche films together.</p>
            </div>
            <div className="clay-card p-6">
              <Globe className="w-8 h-8 text-zinc-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Global Data</h3>
              <p className="text-sm text-zinc-400">Powered by TMDB, offering comprehensive metadata across all languages and regions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
        <div className="clay-card p-8">
          <h2 className="text-xl font-bold text-white mb-4">Data & Infrastructure</h2>
          <p className="text-zinc-400 mb-6 max-w-2xl mx-auto text-sm leading-relaxed">
            All movie, TV show, and actor information is provided by the amazing community at The Movie Database (TMDB). We proudly use the TMDB API to bring you accurate and up-to-date metadata.
          </p>
          <img 
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
            alt="TMDB Logo" 
            className="h-8 mx-auto opacity-80" 
          />
        </div>
      </section>

    </main>
  )
}
