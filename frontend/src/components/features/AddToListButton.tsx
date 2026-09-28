import { useLocation, useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, Lock, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSavedMedia } from '@/context/SavedMediaContext'
import { hasSessionHint } from '@/utils/auth'

export function AddToListButton({ tmdbId, mediaType, title }: { tmdbId: number, mediaType: 'movie' | 'tv', title: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { userPlaylists, isItemInPlaylist, isSaved, togglePlaylist, openCreateModal } = useSavedMedia()
  const signedIn = hasSessionHint()
  const saved = isSaved(tmdbId, mediaType)

  const handleToggle = async (playlistId: string, playlistName: string) => {
    const wasInList = isItemInPlaylist(tmdbId, mediaType, playlistId)
    const success = await togglePlaylist(tmdbId, mediaType, playlistId)
    if (!success) return toast.error('The list could not be updated')
    toast.success(wasInList ? `Removed from "${playlistName}"` : `Saved to "${playlistName}"`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-10 items-center justify-center gap-2 rounded-full border-0 bg-[var(--theme-dark-hover)] px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
        {saved ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        {saved ? 'In your library' : 'Add to List'}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[220px] rounded-xl border border-white/10 bg-[#171817] p-2 text-zinc-100">
        {!signedIn ? (
          <DropdownMenuItem
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
            className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs text-zinc-300"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Sign in to save
          </DropdownMenuItem>
        ) : (
          <>
            {userPlaylists.length === 0 && <DropdownMenuItem disabled className="p-2 text-xs">Loading your lists...</DropdownMenuItem>}
            {userPlaylists.map((playlist) => {
              const inList = isItemInPlaylist(tmdbId, mediaType, playlist.id)
              return (
                <DropdownMenuItem
                  key={playlist.id}
                  onClick={() => handleToggle(playlist.id, playlist.name)}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-200"
                >
                  <span className="truncate">{playlist.name}</span>
                  {inList ? <Check className="h-4 w-4 shrink-0 text-zinc-400" aria-label="Saved" /> : <Plus className="h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden="true" />}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator className="my-1 bg-white/10" />
            <DropdownMenuItem
              onClick={() => openCreateModal({ mediaToAdd: { tmdbId, mediaType, title } })}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg p-2 text-xs font-bold text-[#d2b48c]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Create new list
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
