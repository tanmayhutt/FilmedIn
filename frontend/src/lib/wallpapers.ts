import { fetchApi } from './api'

export async function saveWallpaper(url: string, tmdbId: number, mediaType: 'movie' | 'tv') {
  try {
    await fetchApi('/users/me') // Check auth
    return { success: true, url }
  } catch {
    return { error: 'Not authenticated' }
  }
}

export async function generateWallpaper(tmdbId: number, mediaType: 'movie' | 'tv', title: string, type: 'desktop' | 'mobile', style: string, forceRegenerate: boolean = false): Promise<{ success?: boolean; url?: string; error?: string }> {
  // Mock wallpaper generation since we are pure client side and don't want to expose Fal API keys
  await new Promise(r => setTimeout(r, 2000))
  const width = type === 'desktop' ? 1920 : 1080
  const height = type === 'desktop' ? 1080 : 1920
  
  return { 
    success: true, 
    url: `https://image.pollinations.ai/prompt/${encodeURIComponent(`Cinematic wallpaper of ${title} in ${style} style`)}?width=${width}&height=${height}&nologo=true`
  }
}
