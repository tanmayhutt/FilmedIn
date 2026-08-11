import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { STUDIOS } from '@/lib/studios'
import { GenreRow } from '@/components/features/GenreRow'

const MOVIE_GENRES = [
  { id: 28, label: 'Action' },
  { id: 35, label: 'Comedy' },
  { id: 27, label: 'Horror' },
  { id: 878, label: 'Science Fiction' },
  { id: 10749, label: 'Romance' },
  { id: 53, label: 'Thriller' },
  { id: 16, label: 'Animation' },
  { id: 99, label: 'Documentary' },
  { id: 14, label: 'Fantasy' },
  { id: 80, label: 'Crime' },
  { id: 18, label: 'Drama' },
  { id: 10751, label: 'Family' },
  { id: 12, label: 'Adventure' },
  { id: 10402, label: 'Music' },
  { id: 9648, label: 'Mystery' },
]

const TV_GENRES = [
  { id: 10759, label: 'Action & Adventure' },
  { id: 35, label: 'Comedy' },
  { id: 18, label: 'Drama' },
  { id: 10765, label: 'Sci-Fi & Fantasy' },
  { id: 80, label: 'Crime' },
  { id: 10762, label: 'Kids' },
  { id: 9648, label: 'Mystery' },
  { id: 10767, label: 'Talk Show' },
  { id: 99, label: 'Documentary' },
]

export default function Studio() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const studio = STUDIOS.find(s => s.id === id)
  const [activeTab, setActiveTab] = useState<'movie' | 'tv'>(studio?.type || 'movie')

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!studio) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-semibold mb-2">Studio not found</h2>
        <p className="text-zinc-500 mb-6">We couldn't find the studio you're looking for.</p>
        <button onClick={() => navigate('/')} className="text-blue-500 hover:underline">
          Go back home
        </button>
      </div>
    )
  }

  const activeGenres = activeTab === 'movie' ? MOVIE_GENRES : TV_GENRES

  const getIds = () => {
    if (activeTab === 'movie') {
      return { companyId: studio.tmdbCompanyId, networkId: undefined }
    } else {
      return { 
        companyId: studio.tmdbNetworkId ? undefined : studio.tmdbCompanyId, 
        networkId: studio.tmdbNetworkId 
      }
    }
  }

  const { companyId, networkId } = getIds()

  return (
    <main className="flex-1 flex flex-col w-full pb-16">
      {/* ── Studio Hero Header ── */}
      <div 
        className={`w-full relative h-[300px] sm:h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br ${studio.bgGradient}`}
        style={{ borderBottom: `1px solid ${studio.accentColor}40` }}
      >
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        


        {/* Logo */}
        <div className="relative z-10 w-[80%] max-w-[400px] h-[150px] flex items-center justify-center drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] animate-in fade-in zoom-in-95 duration-700">
          <img src={studio.logoUrl} alt={studio.name} className="max-w-full max-h-full object-contain" />
        </div>
      </div>

      {/* ── Content Rows ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Tabs */}
        <div className="flex items-center justify-center gap-4 border-b border-white/10/50 pb-4">
          <button 
            onClick={() => setActiveTab('movie')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'movie' 
                ? 'bg-zinc-100 text-zinc-900 shadow-lg' 
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-[var(--theme-dark-hover)]'
            }`}
          >
            Movies
          </button>
          <button 
            onClick={() => setActiveTab('tv')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'tv' 
                ? 'bg-zinc-100 text-zinc-900 shadow-lg' 
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-[var(--theme-dark-hover)]'
            }`}
          >
            TV Shows
          </button>
        </div>

        <div className="space-y-12">
          {(!companyId && !networkId) ? (
            <div className="text-center py-12 text-zinc-500">
              No {activeTab === 'movie' ? 'movies' : 'TV shows'} available for this studio.
            </div>
          ) : (
            activeGenres.map(genre => (
              <GenreRow 
                key={`${activeTab}-${genre.id}`} 
                title={genre.label} 
                genreId={genre.id} 
                type={activeTab}
                companyId={companyId}
                networkId={networkId}
              />
            ))
          )}
        </div>

      </div>
    </main>
  )
}
