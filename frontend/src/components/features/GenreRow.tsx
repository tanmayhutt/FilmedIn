import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchByGenre, fetchByCompany, fetchByNetwork, TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'
import { MediaCard } from '@/components/features/MediaCard'

interface GenreRowProps {
  title: string
  genreId: number
  type: 'movie' | 'tv'
  companyId?: number
  networkId?: number
}

export function GenreRow({ title, genreId, type, companyId, networkId }: GenreRowProps) {
  const [items, setItems] = useState<(TMDBMovie | TMDBTVShow)[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return;

    setLoading(true)
    let fetcher = fetchByGenre(genreId, type);
    if (companyId) {
      fetcher = fetchByCompany(companyId, genreId, type);
    } else if (networkId) {
      fetcher = fetchByNetwork(networkId, genreId, type);
    }
    
    fetcher.then(data => {
      setItems(data.slice(0, 20))
      setLoading(false)
    })
  }, [genreId, type, companyId, networkId, visible])

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 640 : -640, behavior: 'smooth' })
    }
  }

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {/* Row header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-[3px] h-5 bg-white rounded-full" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100">{title}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-[var(--theme-dark)] border border-white/10 hover:bg-[var(--theme-dark-hover)] hover:border-zinc-600 text-zinc-500 hover:text-white transition-all duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-[var(--theme-dark)] border border-white/10 hover:bg-[var(--theme-dark-hover)] hover:border-zinc-600 text-zinc-500 hover:text-white transition-all duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[180px] sm:w-[200px] rounded-2xl bg-[var(--theme-dark)] animate-pulse aspect-[2/3]"
              />
            ))
          : items.map((item) => (
              <MediaCard key={item.id} media={{ ...item, media_type: type } as any} />
            ))}
      </div>
    </section>
  )
}
