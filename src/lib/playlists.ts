import { supabase } from './supabase'

export async function getPlaylists() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('playlists')
    .select('*, playlist_items(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function createPlaylist(name: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('playlists')
    .insert({ user_id: user.id, name, type: 'custom' })
    .select()
    .single()

  if (error) return { error: error.message }
  return { success: true, playlist: data }
}

export async function deletePlaylist(id: string) {
  const { error } = await supabase.from('playlists').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function addToList(playlistId: string, tmdbId: number, mediaType: 'movie' | 'tv') {
  const { error } = await supabase
    .from('playlist_items')
    .insert({ playlist_id: playlistId, tmdb_id: tmdbId, media_type: mediaType })

  if (error) {
    if (error.code === '23505') return { message: 'Item already exists in playlist' }
    return { error: error.message }
  }
  return { success: true, message: 'Added to playlist!' }
}
