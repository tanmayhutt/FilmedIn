import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchTVDetails, fetchSeasonDetails, TMDBTVShow, TMDBSeason, TMDBEpisode } from '@/services/tmdb.service'
import { AddToListButton } from '@/components/features/AddToListButton'
import { WallpaperGenerator } from '@/components/features/WallpaperGenerator'
import { EpisodeHeatmap } from '@/components/features/EpisodeHeatmap'
import { Star, ChevronDown, ChevronRight, Tv } from 'lucide-react'

function RatingPill({ rating }: { rating: number }) {
  const color = rating >= 8.5 ? 'clay-badge-emerald' : rating >= 7.5 ? 'clay-badge-blue' : 'clay-badge-amber'
  return (
    <span className={`px-2.5 py-0.5 ${color} text-xs font-bold font-mono inline-flex items-center gap-1`}>
      <Star className="w-3 h-3 fill-white stroke-none" />
      {rating.toFixed(1)}
    </span>
  )
}

function EpisodeCard({ ep }: { ep: TMDBEpisode }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="clay-card p-2 overflow-hidden transition-all">
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-4 p-3 text-left hover:bg-white/5 transition-colors rounded-xl"
      >
        <div className="w-24 aspect-video clay-poster overflow-hidden shrink-0 relative bg-[#1b1b22]">
          {ep.still_path ? (
            <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt={ep.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-[10px]">No Image</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-white text-sm truncate">
              E{ep.episode_number}. {ep.name}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {ep.vote_average > 0 && <RatingPill rating={ep.vote_average} />}
            </div>
          </div>
          {ep.air_date && (
            <p className="text-xs text-zinc-400 font-mono">{new Date(ep.air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
          {!expanded && ep.overview && (
            <p className="text-xs text-zinc-300 mt-2 line-clamp-2">{ep.overview}</p>
          )}
        </div>
      </button>

      {expanded && ep.overview && (
        <div className="px-4 pb-4 pt-0 border-t border-white/10 mt-2">
          <p className="text-sm text-zinc-200 leading-relaxed pt-3">{ep.overview}</p>
        </div>
      )}
    </div>
  )
}

function SeasonSection({ tvId, seasonNumber, seasonName, posterPath, seasonRating }: {
  tvId: string;
  seasonNumber: number;
  seasonName: string;
  posterPath: string | null;
  seasonRating: number;
}) {
  const [open, setOpen] = useState(false)
  const [season, setSeason] = useState<TMDBSeason | null>(null)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (!open && !season) {
      setLoading(true)
      const data = await fetchSeasonDetails(tvId, seasonNumber)
      setSeason(data)
      setLoading(false)
    }
    setOpen(p => !p)
  }

  return (
    <div className="clay-card overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
      >
        {posterPath ? (
          <img src={`https://image.tmdb.org/t/p/w200${posterPath}`} alt={seasonName} className="w-12 h-16 object-cover clay-poster shrink-0" />
        ) : (
          <div className="w-12 h-16 clay-poster bg-[#1b1b22] flex items-center justify-center shrink-0">
            <Tv className="w-5 h-5 text-zinc-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base">{seasonName}</h3>
          {season && <p className="text-xs text-zinc-400 font-mono mt-0.5">{season.episodes?.length} episodes</p>}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {seasonRating > 0 && <RatingPill rating={seasonRating} />}
          {open ? <ChevronDown className="w-5 h-5 text-zinc-300" /> : <ChevronRight className="w-5 h-5 text-zinc-300" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/10 p-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 clay-card animate-pulse" />
              ))}
            </div>
          ) : season?.episodes?.length ? (
            season.episodes.map(ep => <EpisodeCard key={ep.id} ep={ep} />)
          ) : (
            <p className="text-zinc-400 text-sm text-center py-4">No episodes found.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function TVDetails() {
  const { id } = useParams<{ id: string }>()
  const [show, setShow] = useState<TMDBTVShow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (id) {
      setLoading(true)
      fetchTVDetails(id).then(data => {
        setShow(data)
        setLoading(false)
      }).catch(e => {
        console.error(e)
        setLoading(false)
      })
    }
  }, [id])

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
        <div className="h-8 bg-[var(--theme-dark)] w-1/3 mb-4 rounded" />
        <div className="h-4 bg-[var(--theme-dark)] w-1/4 mb-12 rounded" />
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/3 aspect-[2/3] bg-[var(--theme-dark)] rounded-lg" />
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-[var(--theme-dark)] w-full rounded" />
            <div className="h-4 bg-[var(--theme-dark)] w-full rounded" />
            <div className="h-4 bg-[var(--theme-dark)] w-3/4 rounded" />
          </div>
        </div>
      </main>
    )
  }

  if (!show) return <main className="p-12 text-center">TV Show not found.</main>

  const seasons = (show as any).seasons?.filter((s: any) => s.season_number > 0) ?? []

  const isUnreleased = show.first_air_date ? new Date(show.first_air_date).getTime() > Date.now() : false

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in">
      <Link to="/" className="px-4 py-2 clay-button-secondary text-xs inline-flex items-center mb-8">← Back to Home</Link>

      <div className="flex flex-col md:flex-row gap-8 sm:gap-12">
        {/* Poster */}
        <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
          <div className="aspect-[2/3] w-full clay-poster overflow-hidden relative mb-6">
            {show.poster_path ? (
              <img src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} alt={show.name} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 bg-[#1b1b22]">No Image</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <AddToListButton tmdbId={show.id} mediaType="tv" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col pt-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">{show.name}</h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {show.first_air_date && (
              <span className="px-3 py-1 clay-badge text-xs font-mono font-bold">
                {new Date(show.first_air_date).getFullYear()}
              </span>
            )}
            <span className="px-3 py-1 clay-badge text-xs font-mono font-bold">
              {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}
            </span>
            {show.genres?.map((g: any) => (
              <span key={g.id} className="px-3.5 py-1 clay-badge-blue text-xs font-semibold">
                {g.name}
              </span>
            ))}
            
            {isUnreleased ? (
              <span className="px-3.5 py-1 clay-badge-blue text-xs font-bold">
                Unreleased: {new Date(show.first_air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            ) : (
              show.vote_average > 0 && (
                <span className="px-3.5 py-1 clay-badge-amber text-xs font-bold flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-white stroke-none" />
                  {show.vote_average.toFixed(1)} / 10
                </span>
              )
            )}
          </div>

          <div className="clay-card p-6 sm:p-8 mb-10">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Overview</h3>
            <p className="text-base sm:text-lg text-zinc-200 leading-relaxed font-medium">
              {show.overview}
            </p>
          </div>

          {/* Cast */}
          <h2 className="text-xl font-semibold mb-5">Cast</h2>
          <div className="flex overflow-x-auto gap-4 pb-4" style={{ scrollbarWidth: 'none' }}>
            {show.credits?.cast?.slice(0, 12).map((actor: any) => (
              <div key={actor.id} className="w-[100px] shrink-0 flex flex-col gap-2 group">
                <div className="aspect-[2/3] w-full rounded-lg bg-[var(--theme-dark)] overflow-hidden relative border border-white/10/50 group-hover:border-white/20 transition-colors">
                  {actor.profile_path ? (
                    <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-600 p-2 text-center">No Photo</div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-xs text-zinc-100 line-clamp-1">{actor.name}</div>
                  <div className="text-xs text-zinc-500 line-clamp-1">{actor.character}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Series Graph Heatmap ── */}
      {seasons.length > 0 && (
        <section className="mt-16 border-t border-white/10/50 pt-12">
          <EpisodeHeatmap tvId={show.id} seasons={seasons} />
        </section>
      )}

      {/* ── Seasons & Episodes ── */}
      {seasons.length > 0 && (
        <section className="mt-16 border-t border-white/10/50 pt-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">Seasons & Episodes</h2>
          <div className="space-y-4">
            {seasons.map((s: any) => (
              <SeasonSection
                key={s.id}
                tvId={id!}
                seasonNumber={s.season_number}
                seasonName={s.name}
                posterPath={s.poster_path}
                seasonRating={s.vote_average ?? 0}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Wallpapers ── */}
      <div className="mt-16 w-full border-t border-white/10/50 pt-16">
        <h2 className="text-3xl font-bold text-zinc-100 mb-8">Generate Wallpapers</h2>
        <WallpaperGenerator tmdbId={show.id} mediaType="tv" title={show.name} />
      </div>
    </main>
  )
}
