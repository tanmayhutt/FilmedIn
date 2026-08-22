import { fetchApi } from '@/services/api.client'

export async function getPlaylists() {
  try {
    const data = await fetchApi('/playlists')
    return data || []
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function createPlaylist(name: string, description: string = '') {
  try {
    const data = await fetchApi('/playlists', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    })
    return { success: true, playlist: data }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deletePlaylist(id: string) {
  try {
    await fetchApi(`/playlists/${id}`, { method: 'DELETE' })
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function addToList(playlistId: string, tmdbId: number, mediaType: 'movie' | 'tv') {
  try {
    const data = await fetchApi('/playlists/items', {
      method: 'POST',
      body: JSON.stringify({ playlistId, tmdbId, mediaType })
    })
    return { success: true, message: data.message || 'Added to collection' }
  } catch (err: any) {
    return { error: err.message || 'Error adding to playlist' }
  }
}

export async function removeFromList(playlistId: string, tmdbId: number, mediaType: 'movie' | 'tv') {
  try {
    await fetchApi(`/playlists/${playlistId}/items/${tmdbId}?mediaType=${mediaType}`, {
      method: 'DELETE'
    })
    return { success: true, message: 'Removed from playlist' }
  } catch (err: any) {
    return { error: err.message || 'Error removing from playlist' }
  }
}

export async function getSavedMediaData() {
  try {
    const data = await fetchApi('/playlists/saved-ids')
    return data || { savedKeys: [], itemMap: {}, playlists: [] }
  } catch (err) {
    console.error(err)
    return { savedKeys: [], itemMap: {}, playlists: [] }
  }
}

export async function getTasteBlend(targetUsername: string) {
  try {
    return await fetchApi(`/playlists/blend/${encodeURIComponent(targetUsername)}`)
  } catch (err) {
    console.error(err)
    return null
  }
}
