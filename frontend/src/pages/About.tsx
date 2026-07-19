import { Film, Tv, Users, Shield, Zap, Globe, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <main className="flex-1 w-full flex flex-col pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center text-center max-w-5xl mx-auto mt-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 opacity-50"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400 mb-8 tracking-widest uppercase">
          <Film className="w-3.5 h-3.5" /> Introducing FilmedIn
        </div>
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-tight mb-8">
          Your Cinematic Identity, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600">Perfectly Captured.</span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl leading-relaxed mb-12">
          We believe that what you watch says a lot about who you are. FilmedIn is the premier social network built explicitly for cinephiles to discover, log, and share their journey through the world of film and television.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/" className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="https://github.com/tanmayhutt/FilmedIn" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-zinc-900 text-white font-medium rounded-full border border-zinc-800 hover:bg-zinc-800 transition-colors">
            View Source
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-zinc-900">
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-4xl sm:text-5xl font-bold text-white mb-2">1M+</span>
              <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Movies Indexed</span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-4xl sm:text-5xl font-bold text-white mb-2">150k+</span>
              <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest">TV Shows</span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-4xl sm:text-5xl font-bold text-white mb-2">100%</span>
              <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Free to Use</span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-4xl sm:text-5xl font-bold text-white mb-2">24/7</span>
              <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Community</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Story & Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">Built by film lovers, for film lovers.</h2>
            <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
              <p>
                The idea for FilmedIn started with a simple frustration: there was no elegant, unified place to track both the movies we were watching and the TV shows we were binging, while also sharing those thoughts with friends in a beautifully designed environment.
              </p>
              <p>
                We set out to build a platform that feels as premium as the streaming services we use every day, but focuses entirely on community, curation, and discovery. No algorithms telling you what to watch—just genuine recommendations from people whose taste you trust.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
              <Shield className="w-8 h-8 text-white mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Ad-Free Experience</h3>
              <p className="text-sm text-zinc-500">Your cinematic identity shouldn't be interrupted by ads. We keep the UI clean and focused.</p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
              <Zap className="w-8 h-8 text-white mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-sm text-zinc-500">Built on modern web technologies ensuring instant searches and snappy navigation.</p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
              <Users className="w-8 h-8 text-white mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Community First</h3>
              <p className="text-sm text-zinc-500">Connect with friends, share playlists, and discover niche films together.</p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
              <Globe className="w-8 h-8 text-white mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Global Data</h3>
              <p className="text-sm text-zinc-500">Powered by TMDB, offering comprehensive metadata across all languages and regions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-zinc-900 text-center">
        <h2 className="text-xl font-bold text-white mb-6">Data & Infrastructure</h2>
        <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
          All movie, TV show, and actor information is provided by the amazing community at The Movie Database (TMDB). We proudly use the TMDB API to bring you accurate and up-to-date metadata.
        </p>
        <img 
          src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
          alt="TMDB Logo" 
          className="h-8 mx-auto opacity-70" 
        />
      </section>

    </main>
  )
}
