import { Link, useNavigate } from 'react-router-dom'
import { TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'
import { Star, Bookmark, Check, Plus, Lock, Heart } from 'lucide-react'
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
      <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#c69b61] z-10 uppercase tracking-wider shadow-md">
        Unreleased
      </div>
    )
  }
  if (!rating || rating === 0) return null
  return (
    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#1b1b22] bg-[#82ac62] z-10 shadow-md">
      <Star className="w-3 h-3 fill-[#1b1b22] text-[#1b1b22]" />
      {rating.toFixed(1)}
    </div>
  )
}

export function MediaCard({ media, disableLink = false, actionButton }: { media: TMDBMovie | TMDBTVShow, disableLink?: boolean, actionButton?: React.ReactNode }) {
  const navigate = useNavigate()
  const {
    isMovie, title, year, isUnreleased, rating, href,
    saved, isLiked, hasToken, savedPlaylistNames, userPlaylists,
    isItemInPlaylist, handleToggle, handleToggleLike, handleOpenCreateModal
  } = useMediaCard(media)

  return (
    <div className="w-[160px] sm:w-[200px] group relative flex flex-col gap-2 shrink-0">
      {/* Poster Image Container */}
      {disableLink ? (
        <div className="relative aspect-[2/3] w-full overflow-hidden clay-poster">
          <RatingBadge rating={rating} isUnreleased={isUnreleased} />
          {media.poster_path ? (
            <img src={`https://image.tmdb.org/t/p/w500${media.poster_path}`} alt={title} loading="lazy" className="object-cover w-full h-full" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--theme-dark)] text-zinc-600 text-xs text-center p-4">No Image</div>
          )}
        </div>
      ) : (
        <Link to={href} className="relative aspect-[2/3] w-full overflow-hidden clay-poster outline-none">
          <RatingBadge rating={rating} isUnreleased={isUnreleased} />
          {media.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
              alt={title}
              loading="lazy"
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--theme-dark)] text-zinc-600 text-xs text-center p-4">
              No Image Available
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>
      )}

      {/* Info Section under Card */}
      <div className="flex items-start justify-between gap-2 pt-1">
        <div className="flex flex-col min-w-0 flex-1">
          {disableLink ? (
            <h3 className="font-bold text-xs sm:text-sm text-zinc-100 line-clamp-1">{title}</h3>
          ) : (
            <Link to={href} className="font-bold text-xs sm:text-sm text-zinc-100 line-clamp-1 group-hover:text-rose-400 transition-colors hover:underline">
              {title}
            </Link>
          )}
          <p className="text-[11px] text-zinc-400 font-medium mt-0.5">{year} · {isMovie ? 'Movie' : 'TV'}</p>
        </div>

        {/* Actions Row: Like Heart + Save Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          {actionButton ? (
            actionButton
          ) : (
            <>
              {/* Plain Like Heart Icon */}
              <button
                type="button"
                onClick={handleToggleLike}
                className={`p-1 transition-all hover:scale-110 active:scale-125 focus:outline-none ${isLiked ? 'text-[#9062aa]' : 'text-zinc-400 hover:text-[#9062aa]'}`}
                title={isLiked ? 'Liked' : 'Like'}
                aria-label={isLiked ? `Unlike ${title}` : `Like ${title}`}
              >
                <Heart className={`w-4 h-4 transition-all ${isLiked ? 'fill-[#9062aa]' : ''}`} />
              </button>

              {/* Plain Bookmark Save Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className={`p-1 transition-all hover:scale-110 active:scale-125 focus:outline-none ${saved ? 'text-[#9062aa]' : 'text-zinc-400 hover:text-[#9062aa]'}`}
                  title={saved ? `Saved in: ${savedPlaylistNames.join(', ')}` : 'Save to list'}
                  aria-label={saved ? `Manage ${title} in your lists` : `Save ${title} to a list`}
                >
                  <Bookmark className={`w-4 h-4 transition-all ${saved ? 'fill-[#9062aa]' : ''}`} />
                </DropdownMenuTrigger>

                <DropdownMenuContent 
                  className="bg-[#1b1b22] border border-white/10 rounded-2xl shadow-2xl text-zinc-100 min-w-[210px] z-50 p-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2.5 py-1.5">
                    <div className="text-xs font-bold text-white truncate max-w-[180px]">{title}</div>
                    {saved ? (
                      <div className="text-[11px] font-medium text-blue-400 mt-0.5">
                        Saved in: {savedPlaylistNames.join(', ')}
                      </div>
                    ) : (
                      <div className="text-[11px] text-zinc-500 mt-0.5">Add to your watchlists</div>
                    )}
                  </div>

                  <DropdownMenuSeparator className="bg-white/10 my-1" />
                  
                  {userPlaylists.length > 0 && (
                    userPlaylists.map((pl) => {
                      const inPl = isItemInPlaylist(pl.id)
                      return (
                        <DropdownMenuItem
                          key={pl.id}
                          onClick={(e) => handleToggle(e, pl.id, pl.name)}
                          className="flex items-center justify-between cursor-pointer hover:bg-white/5 py-2 px-2.5 rounded-xl text-zinc-200 hover:text-white transition-colors"
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
                      className="text-xs text-blue-400 font-bold cursor-pointer hover:bg-white/5 p-2 flex items-center gap-1.5 mt-1 border-t border-white/5 rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create New List
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/login'); }}
                      className="text-xs text-zinc-400 cursor-pointer hover:bg-white/5 flex items-center gap-1.5 p-2 rounded-xl"
                    >
                      <Lock className="w-3.5 h-3.5" /> Sign in to save
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
