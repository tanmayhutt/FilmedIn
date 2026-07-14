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

export async function createPlaylist(name: string) {
  try {
    const data = await fetchApi('/playlists', {
      method: 'POST',
      body: JSON.stringify({ name })
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
    await fetchApi('/playlists/items', {
      method: 'POST',
      body: JSON.stringify({ playlistId, tmdbId, mediaType })
    })
    return { success: true, message: 'Added to playlist!' }
  } catch (err: any) {
    return { error: err.message || 'Error adding to playlist' }
  }
}
