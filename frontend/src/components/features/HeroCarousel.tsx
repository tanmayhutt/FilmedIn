import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTrendingMovies, fetchTrendingTV, TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'

export function HeroCarousel() {
  const [items, setItems] = useState<(TMDBMovie | TMDBTVShow)[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadHeroItems() {
      try {
        const [movies, tv] = await Promise.all([
          fetchTrendingMovies(),
          fetchTrendingTV()
        ])
        
        const interleaved = []
        for (let i = 0; i < 5; i++) {
          if (movies[i]) interleaved.push(movies[i])
          if (tv[i]) interleaved.push(tv[i])
        }
        
        // Filter out items without backdrops
        const validItems = interleaved.filter(item => item.backdrop_path)
        setItems(validItems.slice(0, 7)) // Top 7 for the carousel
      } catch (err) {
        console.error('Failed to load hero items', err)
      }
    }
    loadHeroItems()
  }, [])

  useEffect(() => {
    if (items.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length)
    }, 6000) // Rotate every 6 seconds
    return () => clearInterval(interval)
  }, [items.length])

  if (items.length === 0) {
    return <div className="w-full h-[60vh] sm:h-[85vh] bg-[var(--theme-dark)] animate-pulse" />
  }

  const currentItem = items[currentIndex]
  const title = currentItem.media_type === 'movie' ? (currentItem as TMDBMovie).title : (currentItem as TMDBTVShow).name
  const date = currentItem.media_type === 'movie' ? (currentItem as TMDBMovie).release_date : (currentItem as TMDBTVShow).first_air_date

  const handlePrev = () => setCurrentIndex(prev => (prev === 0 ? items.length - 1 : prev - 1))
  const handleNext = () => setCurrentIndex(prev => (prev + 1) % items.length)

  return (
    <div className="relative w-full h-[60vh] sm:h-[85vh] overflow-hidden group">
      {/* Background Images */}
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${item.backdrop_path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top'
          }}
        />
      ))}
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3.5 py-1 clay-badge-blue text-xs font-mono font-bold uppercase tracking-wider">
              {currentItem.media_type === 'movie' ? 'Featured Movie' : 'Featured TV Show'}
            </span>
            <span className="text-sm font-semibold text-zinc-200">
              {date?.substring(0, 4)}
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-2xl">
            {title}
          </h1>
          
          <p className="text-sm sm:text-lg text-zinc-200 line-clamp-3 mb-8 drop-shadow-md max-w-xl font-medium">
            {currentItem.overview}
          </p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/${currentItem.media_type}/${currentItem.id}`)}
              className="px-8 py-3.5 clay-button-primary text-base font-bold flex items-center gap-2"
            >
              <Info className="w-5 h-5" />
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 border border-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 focus:outline-none hover:bg-black/60"
      >
        <ChevronLeft className="w-6 h-6 -ml-0.5" />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 border border-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 focus:outline-none hover:bg-black/60"
      >
        <ChevronRight className="w-6 h-6 ml-0.5" />
      </button>

      {/* Subtle Bottom Wave Mask */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none z-10">
        <svg className="w-full h-12 sm:h-20 text-[#444b58] preserve-3d" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60C240 100 480 20 720 60C960 100 1200 30 1440 60V120H0V60Z" fill="currentColor"/>
        </svg>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full focus:outline-none ${
              idx === currentIndex 
                ? 'w-8 h-2.5 bg-[#9062aa] shadow-md' 
                : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
