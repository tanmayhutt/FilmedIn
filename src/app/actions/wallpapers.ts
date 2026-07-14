'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function generateWallpaper(
  tmdbId: number, 
  mediaType: 'movie' | 'tv', 
  promptBase: string, 
  type: 'desktop' | 'mobile',
  styleTag?: string,
  forceRegenerate?: boolean
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to generate wallpapers' }

  const column = type === 'desktop' ? 'desktop_url' : 'mobile_url'
  
  let existing: any = null;

  if (!forceRegenerate) {
    // Check if wallpaper exists
    const { data: existingData } = await supabase
      .from('wallpapers')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType)
      .single()
      
    existing = existingData;

    if (existing && existing[column]) {
      return { url: existing[column] }
    }
  } else {
    // Fetch existing record to update it instead of creating a new one
    const { data: existingData } = await supabase
      .from('wallpapers')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType)
      .single()
    existing = existingData;
  }

  // Generate with Pollinations.ai (Flux Model)
  const styleStr = styleTag ? `${styleTag} style, ` : 'Cinematic, masterpiece, highly detailed, '
  const rawPrompt = `${styleStr}stunning wallpaper for ${promptBase}. no text, no title, clear focus, beautiful composition, 8k resolution, trending on artstation.`
  const prompt = encodeURIComponent(rawPrompt)
  
  const width = type === 'desktop' ? 1920 : 1080
  const height = type === 'desktop' ? 1080 : 1920
  const seed = forceRegenerate ? `&seed=${Math.floor(Math.random() * 1000000)}` : ''
  
  const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=${width}&height=${height}&nologo=true&enhance=true&model=flux${seed}`
  
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
        .update({ [column]: publicUrl, prompt_used: rawPrompt })
        .eq('id', existing.id)
    } else {
      await supabaseAdmin
        .from('wallpapers')
        .insert({
          tmdb_id: tmdbId,
          media_type: mediaType,
          [column]: publicUrl,
          prompt_used: rawPrompt
        })
    }

    return { url: publicUrl }
  } catch (error: any) {
    console.error("Wallpaper generation error:", error)
    return { error: error.message || 'Failed to generate wallpaper' }
  }
}
