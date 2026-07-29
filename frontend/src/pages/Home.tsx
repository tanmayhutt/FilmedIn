import { useState } from 'react'
import { Tv, Sparkles, ChevronRight, Compass, Flame, Film, Clapperboard, Star } from 'lucide-react'
import { TrendingMovies, TrendingTV } from '@/components/features/TrendingMedia'
import { GenreRow } from '@/components/features/GenreRow'
import { HeroCarousel } from '@/components/features/HeroCarousel'
import { Link } from 'react-router-dom'
import { STUDIOS } from '@/lib/studios'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'movies' | 'tv' | 'action' | 'scifi'>('all')

  return (
    <div className="min-h-screen pb-24 space-y-10">
      {/* ✦ Hero Auto-Sliding Window ✦ */}
      <HeroCarousel />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ── Studio Universes Bar ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Studio & Network Universes
            </h3>
            <Link to="/studios" className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 font-semibold">
              All Studios <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {STUDIOS.slice(0, 6).map(studio => (
              <Link
                key={studio.id}
                to={`/studio/${studio.id}`}
                className="bg-[#1b1b22] hover:bg-[#23232c] p-4 h-20 rounded-[1.75rem] flex items-center justify-center group hover:scale-[1.04] transition-all border border-white/10 hover:border-[#9062aa]/40 shadow-xl"
              >
                <img 
                  src={studio.logoUrl} 
                  alt={studio.name} 
                  className="max-h-8 sm:max-h-10 max-w-[80%] object-contain filter brightness-0 invert opacity-90 group-hover:opacity-100 transition-all" 
                />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Organic Wavy Accent ── */}
        <div className="relative h-12 w-full overflow-hidden flex items-center justify-center my-6 opacity-70">
          <svg className="w-full max-w-2xl h-full text-[#9062aa]" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="4" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,50 C250,100 250,0 500,50 C750,100 750,0 1000,50" />
          </svg>
        </div>

        {/* ── Category Filter Bar ── */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 p-2 bg-[#1b1b22] rounded-full w-fit overflow-x-auto scrollbar-hide border border-white/10 shadow-lg">
            {[
              { id: 'all', label: 'All Trending' },
              { id: 'movies', label: 'Movies' },
              { id: 'tv', label: 'TV Shows' },
              { id: 'action', label: 'Action & Thrillers' },
              { id: 'scifi', label: 'Sci-Fi & Fantasy' }
            ].map(cat => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#9062aa] text-white shadow-lg scale-105' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* ── Trending Movies Section ── */}
          {(activeCategory === 'all' || activeCategory === 'movies') && (
            <section className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Trending Movies</h2>
                <Link to="/explore?type=movie" className="text-xs text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-1">
                  Explore All <ChevronRight size={14} />
                </Link>
              </div>
              <TrendingMovies />
            </section>
          )}

          {/* ── Trending TV Shows Section ── */}
          {(activeCategory === 'all' || activeCategory === 'tv') && (
            <section className="space-y-6 animate-in fade-in pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Trending TV Shows</h2>
                <Link to="/explore?type=tv" className="text-xs text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-1">
                  Explore All <ChevronRight size={14} />
                </Link>
              </div>
              <TrendingTV />
            </section>
          )}

          {/* ── Action & Sci-Fi Genre Sections ── */}
          {(activeCategory === 'all' || activeCategory === 'action') && (
            <section className="animate-in fade-in pt-2">
              <GenreRow title="Action & Adventure" genreId={28} type="movie" />
            </section>
          )}

          {(activeCategory === 'all' || activeCategory === 'scifi') && (
            <section className="animate-in fade-in pt-2">
              <GenreRow title="Sci-Fi & Fantasy" genreId={10765} type="tv" />
            </section>
          )}

          {(activeCategory === 'all' || activeCategory === 'movies') && (
            <section className="animate-in fade-in pt-2">
              <GenreRow title="Comedies" genreId={35} type="movie" />
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
