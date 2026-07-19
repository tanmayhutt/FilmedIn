import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTrendingMovies, fetchTrendingTV, TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
        
        // Combine and shuffle top items to feature
        const combined = [...movies.slice(0, 5), ...tv.slice(0, 5)]
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
    return <div className="w-full h-[60vh] sm:h-[85vh] bg-zinc-900 animate-pulse" />
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
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-sm border border-white/10">
              {currentItem.media_type === 'movie' ? 'Featured Movie' : 'Featured TV Show'}
            </span>
            <span className="text-sm font-medium text-zinc-300 shadow-sm">
              {date?.substring(0, 4)}
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-4 drop-shadow-2xl">
            {title}
          </h1>
          
          <p className="text-sm sm:text-lg text-zinc-300 line-clamp-3 mb-8 drop-shadow-md max-w-xl">
            {currentItem.overview}
          </p>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate(`/${currentItem.media_type}/${currentItem.id}`)}
              className="bg-white text-zinc-950 hover:bg-zinc-200 h-12 px-8 text-base font-semibold rounded-lg shadow-xl transition-transform hover:scale-105"
            >
              <Info className="w-5 h-5 mr-2" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black focus:outline-none"
      >
        <ChevronLeft className="w-6 h-6 -ml-1" />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black focus:outline-none"
      >
        <ChevronRight className="w-6 h-6 ml-1" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full focus:outline-none ${
              idx === currentIndex 
                ? 'w-6 h-1.5 bg-white' 
                : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
