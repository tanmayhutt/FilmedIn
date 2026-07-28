import { TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'
import { useSavedMedia } from '@/context/SavedMediaContext'
import { parseMediaDetails, getSavedPlaylistNames } from '@/utils/media.utils'
import { createPlaylist } from '@/services/playlist.service'
import toast from 'react-hot-toast'

export function useMediaCard(media: TMDBMovie | TMDBTVShow) {
  const { isSaved, isItemInPlaylist, userPlaylists, togglePlaylist, openCreateModal, refreshSaved, itemMap } = useSavedMedia()

  const details = parseMediaDetails(media)
  const saved = media?.id ? isSaved(media.id) : false
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

  const likedPlaylist = userPlaylists.find(pl => pl.name.toLowerCase() === 'liked')
  const isLiked = likedPlaylist && media?.id ? isItemInPlaylist(media.id, likedPlaylist.id) : false

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!hasToken) {
      toast.error('Please sign in to like titles')
      return
    }

    let targetPl = likedPlaylist
    if (!targetPl) {
      const res = await createPlaylist('Liked', 'Your liked movies and TV shows')
      if (res.playlist && res.playlist.id) {
        targetPl = res.playlist
        await refreshSaved()
      }
    }

    if (targetPl) {
      await handleToggle(e, targetPl.id, 'Liked')
    } else {
      toast.error('Failed to initialize Liked playlist')
    }
  }

  return {
    ...details,
    saved,
    isLiked,
    hasToken,
    savedPlaylistNames,
    userPlaylists,
    isItemInPlaylist: (playlistId: string) => isItemInPlaylist(media.id, playlistId),
    handleToggle,
    handleToggleLike,
    handleOpenCreateModal,
  }
}
