import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchByCompany, fetchByNetwork, TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'

interface StudioRowProps {
  title: string
  subtitle?: string
  companyId?: number
  networkId?: number
  mediaType: 'movie' | 'tv'
  accentColor?: string
}

export function StudioRow({ title, subtitle, companyId, networkId, mediaType, accentColor = '#ffffff' }: StudioRowProps) {
  const [items, setItems] = useState<(TMDBMovie | TMDBTVShow)[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setLoading(true)
    const fetcher = networkId
      ? fetchByNetwork(networkId)
      : fetchByCompany(companyId!)
    fetcher.then(data => {
      setItems((data as any[]).slice(0, 20))
      setLoading(false)
    })
  }, [companyId, networkId])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 640 : -640, behavior: 'smooth' })
  }

  const handleClick = (item: TMDBMovie | TMDBTVShow) => {
    if (item.media_type === 'movie') navigate(`/movie/${item.id}`)
    else navigate(`/tv/${item.id}`)
  }

  const getTitle = (item: TMDBMovie | TMDBTVShow) =>
    item.media_type === 'movie' ? (item as TMDBMovie).title : (item as TMDBTVShow).name

  const getYear = (item: TMDBMovie | TMDBTVShow) => {
    const date = item.media_type === 'movie'
      ? (item as TMDBMovie).release_date
      : (item as TMDBTVShow).first_air_date
    return date?.substring(0, 4) || ''
  }

  return (
    <section
      ref={sectionRef}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {/* Row header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-[3px] h-5 rounded-full" style={{ backgroundColor: accentColor }} />
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h3>
            {subtitle && <p className="text-[11px] text-zinc-600 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-white transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-white transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[130px] rounded-lg bg-zinc-900 animate-pulse" style={{ aspectRatio: '2/3' }} />
            ))
          : items.map(item => (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="group/card shrink-0 w-[130px] flex flex-col gap-2 text-left focus:outline-none"
              >
                <div className="relative w-full rounded-lg overflow-hidden bg-zinc-900" style={{ aspectRatio: '2/3' }}>
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                      alt={getTitle(item)}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.06]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs p-3 text-center">{getTitle(item)}</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/25 transition-all duration-300" />
                  {item.vote_average > 0 && (
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md tabular-nums">
                      {item.vote_average.toFixed(1)}
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end px-2 pb-2">
                    <span className="text-zinc-300 text-[10px]">{getYear(item)}</span>
                  </div>
                </div>
                <p className="text-zinc-400 text-xs font-medium leading-tight line-clamp-2 px-0.5 group-hover/card:text-zinc-100 transition-colors duration-200">
                  {getTitle(item)}
                </p>
              </button>
            ))}
      </div>
    </section>
  )
}
