import { fetchApi } from '@/services/api.client'

export async function saveWallpaper(url: string, tmdbId: number, mediaType: 'movie' | 'tv') {
  try {
    await fetchApi('/users/me') // Check auth
    return { success: true, url }
  } catch {
    return { error: 'Not authenticated' }
  }
}

export async function generateWallpaper(tmdbId: number, mediaType: 'movie' | 'tv', title: string, type: 'desktop' | 'mobile', style: string, themeMode: 'light' | 'dark' = 'dark', forceRegenerate: boolean = false): Promise<{ success?: boolean; url?: string; error?: string }> {
  try {
    const res = await fetchApi('/wallpapers/generate', {
      method: 'POST',
      body: JSON.stringify({ tmdbId, mediaType, title, type, style, themeMode, forceRegenerate })
    });
    
    if (res.error) {
      return { error: res.error };
    }
    
    // The backend returns a base64 string
    return { success: true, url: `data:image/jpeg;base64,${res.base64}` };
  } catch (err: any) {
    return { error: err.message || 'Failed to generate wallpaper' };
  }
}
