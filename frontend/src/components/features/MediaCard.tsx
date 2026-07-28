import { Link, useNavigate } from 'react-router-dom'
import { TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'
import { Star, Bookmark, Check, Plus, Lock } from 'lucide-react'
import { useMediaCard } from '@/hooks/useMediaCard'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

function RatingBadge({ rating, isUnreleased }: { rating: number, isUnreleased: boolean }) {
  if (isUnreleased) {
    return (
      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white bg-blue-600/90 backdrop-blur-sm z-10 uppercase tracking-wider">
        Unreleased
      </div>
    )
  }
  if (!rating || rating === 0) return null
  const color = rating >= 7.5 ? 'bg-yellow-500/90' : rating >= 6 ? 'bg-zinc-700/90' : 'bg-red-900/80'
  return (
    <div className={`absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-bold text-white ${color} backdrop-blur-sm z-10`}>
      <Star className="w-2.5 h-2.5 fill-white stroke-none" />
      {rating.toFixed(1)}
    </div>
  )
}

export function MediaCard({ media, disableLink = false, actionButton }: { media: TMDBMovie | TMDBTVShow, disableLink?: boolean, actionButton?: React.ReactNode }) {
  const navigate = useNavigate()
  const {
    isMovie, title, year, isUnreleased, rating, href,
    saved, hasToken, savedPlaylistNames, userPlaylists,
    isItemInPlaylist, handleToggle, handleOpenCreateModal
  } = useMediaCard(media)

  return (
    <div className="w-[160px] sm:w-[200px] group relative flex flex-col gap-2 shrink-0">
      {/* Poster Image Container */}
      {disableLink ? (
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800/50">
          <RatingBadge rating={rating} isUnreleased={isUnreleased} />
          {media.poster_path ? (
            <img src={`https://image.tmdb.org/t/p/w500${media.poster_path}`} alt={title} loading="lazy" className="object-cover w-full h-full" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs text-center p-4">No Image</div>
          )}
        </div>
      ) : (
        <Link to={href} className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800/50 transition-colors group-hover:border-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
          <RatingBadge rating={rating} isUnreleased={isUnreleased} />
          {media.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
              alt={title}
              loading="lazy"
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs text-center p-4">
              No Image Available
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>
      )}

      {/* Info Section under Card */}
      <div className="flex items-start justify-between gap-1 pt-1">
        <div className="flex flex-col min-w-0 flex-1">
          {disableLink ? (
            <h3 className="font-semibold text-sm text-zinc-100 line-clamp-1">{title}</h3>
          ) : (
            <Link to={href} className="font-semibold text-sm text-zinc-100 line-clamp-1 group-hover:text-white transition-colors hover:underline">
              {title}
            </Link>
          )}
          <p className="text-xs text-zinc-500">{year} · {isMovie ? 'Movie' : 'TV'}</p>
        </div>

        {/* Action Button or Bookmark Save Badge Dropdown */}
        <div className="shrink-0 pt-0.5">
          {actionButton ? (
            actionButton
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className={`p-1.5 rounded-full transition-all border outline-none focus:outline-none ${
                    saved
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 hover:bg-blue-600/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                  }`}
                  title={saved ? `Saved in: ${savedPlaylistNames.join(', ')}` : 'Save to list'}
                >
                  <Bookmark className={`w-4 h-4 transition-transform active:scale-125 ${saved ? 'fill-blue-400 stroke-blue-400' : ''}`} />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent 
                className="bg-zinc-950 border-zinc-800 text-zinc-100 min-w-[210px] shadow-2xl z-50 p-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1.5">
                  <div className="text-xs font-bold text-white truncate max-w-[180px]">{title}</div>
                  {saved ? (
                    <div className="text-[11px] font-medium text-blue-400 mt-0.5">
                      Saved in: {savedPlaylistNames.join(', ')}
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-500 mt-0.5">Add to your watchlists</div>
                  )}
                </div>

                <DropdownMenuSeparator className="bg-zinc-800 my-1" />
                
                {userPlaylists.length > 0 && (
                  userPlaylists.map((pl) => {
                    const inPl = isItemInPlaylist(pl.id)
                    return (
                      <DropdownMenuItem
                        key={pl.id}
                        onClick={(e) => handleToggle(e, pl.id, pl.name)}
                        className="flex items-center justify-between cursor-pointer focus:bg-zinc-900 focus:text-zinc-50 py-2 px-2.5 rounded-md"
                      >
                        <span className="truncate max-w-[140px] text-xs font-medium">{pl.name}</span>
                        {inPl ? (
                          <Check className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        )}
                      </DropdownMenuItem>
                    )
                  })
                )}

                {hasToken ? (
                  <DropdownMenuItem 
                    onClick={handleOpenCreateModal}
                    className="text-xs text-blue-400 font-semibold cursor-pointer focus:bg-zinc-900 p-2 flex items-center gap-1.5 mt-1 border-t border-zinc-800/80"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create New List
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/login'); }}
                    className="text-xs text-zinc-400 cursor-pointer focus:bg-zinc-900 flex items-center gap-1.5 p-2"
                  >
                    <Lock className="w-3.5 h-3.5" /> Sign in to save
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
