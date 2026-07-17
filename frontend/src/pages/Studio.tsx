import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
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

  const genres = studio.type === 'movie' ? MOVIE_GENRES : TV_GENRES

  return (
    <main className="flex-1 flex flex-col w-full pb-16">
      {/* ── Studio Hero Header ── */}
      <div 
        className={`w-full relative h-[300px] sm:h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br ${studio.bgGradient}`}
        style={{ borderBottom: `1px solid ${studio.accentColor}40` }}
      >
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-300 hover:text-white transition-colors bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-700 hover:border-zinc-500">
            <ChevronLeft size={16} />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>

        {/* Logo */}
        <div className="relative z-10 scale-150 sm:scale-150 drop-shadow-2xl animate-in fade-in zoom-in-95 duration-700">
          {studio.logo}
        </div>
      </div>

      {/* ── Content Rows ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        
        {/* We use a loop of GenreRows but limit to top ones for performance, or show all. Let's show all. */}
        {genres.map(genre => (
          <GenreRow 
            key={genre.id} 
            title={genre.label} 
            genreId={genre.id} 
            type={studio.type}
            companyId={studio.type === 'movie' ? studio.tmdbId : undefined}
            networkId={studio.type === 'tv' ? studio.tmdbId : undefined}
          />
        ))}

      </div>
    </main>
  )
}
