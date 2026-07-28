import { TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'
import { useSavedMedia } from '@/context/SavedMediaContext'
import { parseMediaDetails, getSavedPlaylistNames } from '@/utils/media.utils'
import toast from 'react-hot-toast'

export function useMediaCard(media: TMDBMovie | TMDBTVShow) {
  const { isSaved, isItemInPlaylist, userPlaylists, togglePlaylist, openCreateModal, itemMap } = useSavedMedia()

  const details = parseMediaDetails(media)
  const saved = isSaved && media?.id ? isSaved(media.id) : false
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token')

  const savedPlaylistNames = getSavedPlaylistNames(media?.id, itemMap, userPlaylists)

  const handleToggle = async (e: React.MouseEvent, playlistId: string, playlistName: string) => {
    e.preventDefault()
    e.stopPropagation()
    const currentlyIn = isItemInPlaylist(media.id, playlistId)
    const success = await togglePlaylist(media.id, details.mediaType, playlistId)
    if (success) {
      if (currentlyIn) {
        toast.success(`Removed from "${playlistName}"`)
      } else {
        toast.success(`Added to "${playlistName}"`)
      }
    } else {
      toast.error('Failed to update list')
    }
  }

  const handleOpenCreateModal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openCreateModal({
      mediaToAdd: {
        tmdbId: media.id,
        mediaType: details.mediaType,
        title: details.title,
      }
    })
  }

  return {
    ...details,
    saved,
    hasToken,
    savedPlaylistNames,
    userPlaylists,
    isItemInPlaylist: (playlistId: string) => isItemInPlaylist(media.id, playlistId),
    handleToggle,
    handleOpenCreateModal,
  }
}
