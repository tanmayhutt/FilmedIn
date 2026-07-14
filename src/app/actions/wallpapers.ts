'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function generateWallpaper(tmdbId: number, mediaType: 'movie' | 'tv', promptBase: string, type: 'desktop' | 'mobile') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in to generate wallpapers')

  // Check if wallpaper exists
  const { data: existing } = await supabase
    .from('wallpapers')
    .select('*')
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .single()

  const column = type === 'desktop' ? 'desktop_url' : 'mobile_url'

  if (existing && existing[column]) {
    return { url: existing[column] }
  }

  // Generate with Pollinations.ai
  const prompt = encodeURIComponent(`Cinematic, high quality, 8k, masterpiece, minimalist wallpaper for ${promptBase}`)
  const width = type === 'desktop' ? 1920 : 1080
  const height = type === 'desktop' ? 1080 : 1920
  
  const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=${width}&height=${height}&nologo=true`
  
  try {
    const res = await fetch(imageUrl)
    if (!res.ok) throw new Error('Failed to fetch from AI')
    const blob = await res.blob()
    const arrayBuffer = await blob.arrayBuffer()

    const fileName = `${mediaType}_${tmdbId}_${type}_${Date.now()}.jpg`
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('wallpapers')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg'
      })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from('wallpapers')
      .getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl

    // Update or Insert into wallpapers table
    if (existing) {
      await supabaseAdmin
        .from('wallpapers')
        .update({ [column]: publicUrl, prompt_used: decodeURIComponent(prompt) })
        .eq('id', existing.id)
    } else {
      await supabaseAdmin
        .from('wallpapers')
        .insert({
          tmdb_id: tmdbId,
          media_type: mediaType,
          [column]: publicUrl,
          prompt_used: decodeURIComponent(prompt)
        })
    }

    return { url: publicUrl }
  } catch (error) {
    console.error(error)
    throw new Error('Failed to generate wallpaper')
  }
}
