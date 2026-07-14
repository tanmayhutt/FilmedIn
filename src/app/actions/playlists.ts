'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addToList(playlistId: string, tmdbId: number, mediaType: 'movie' | 'tv') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('playlist_items')
    .insert({
      playlist_id: playlistId,
      tmdb_id: tmdbId,
      media_type: mediaType
    })

  if (error) {
    if (error.code === '23505') {
      return { success: true, message: 'Already in playlist' }
    }
    throw new Error(error.message)
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function getUserPlaylists() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return []
  return data
}
