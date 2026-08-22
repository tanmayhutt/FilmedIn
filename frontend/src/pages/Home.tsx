import { useState } from 'react'
import { Bookmark, CheckCircle2, ChevronRight, Heart, Library, PlayCircle, Users } from 'lucide-react'
import { TrendingMovies, TrendingTV } from '@/components/features/TrendingMedia'
import { GenreRow } from '@/components/features/GenreRow'
import { HeroCarousel } from '@/components/features/HeroCarousel'
import { Link } from 'react-router-dom'
import { STUDIOS } from '@/lib/studios'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'movies' | 'tv' | 'action' | 'scifi'>('all')

  return (
    <div className="min-h-screen pb-24 space-y-10">
      {/* Hero carousel */}
      <HeroCarousel />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-12">
        <section className="clay-card border border-white/10 p-6 sm:p-9 lg:p-10" aria-labelledby="collection-promise">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d2b48c]">Movies and TV, finally together</p>
              <h2 id="collection-promise" className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                One calm place for everything you watch.
              </h2>
              <p className="mt-4 text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7">
                Keep your watchlist, current shows, completed titles, favourites, and personal collections in one library. Share your profile and compare taste without the clutter of a media database.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/profile" className="clay-button-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
                  <Library className="h-4 w-4" aria-hidden="true" /> Open My Library
                </Link>
                <Link to="/search" className="clay-button-secondary inline-flex items-center gap-2 px-6 py-3 text-sm">
                  Find a title <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Watching', detail: 'In progress', icon: PlayCircle },
                { label: 'Watchlist', detail: 'Up next', icon: Bookmark },
                { label: 'Watched', detail: 'Completed', icon: CheckCircle2 },
                { label: 'Liked', detail: 'Favourites', icon: Heart },
              ].map(({ label, detail, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-white/[0.08] bg-black/20 p-4 sm:p-5">
                  <Icon className="h-5 w-5 text-zinc-500" aria-hidden="true" />
                  <p className="mt-5 text-sm font-bold text-white">{label}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{detail}</p>
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-4">
                <Users className="h-5 w-5 text-zinc-500" aria-hidden="true" />
                <p className="text-xs font-semibold text-zinc-300">Follow people whose taste you trust and build a Taste Blend together.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Studio and network shortcuts */}
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
                className="bg-[#171817] hover:bg-[#20211f] p-4 h-20 rounded-xl flex items-center justify-center group transition-colors border border-white/[0.08] hover:border-[#d2b48c]/30"
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

        {/* Category filter */}
        <div className="space-y-8">
          <div className="flex max-w-full w-fit items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#171817] p-1.5 scrollbar-hide">
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
                      ? 'bg-[#e8e0d3] text-[#111210]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Trending movies */}
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

          {/* Trending TV shows */}
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

          {/* Genre sections */}
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
