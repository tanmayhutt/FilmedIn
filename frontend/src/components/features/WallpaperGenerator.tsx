'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateWallpaper } from '@/services/wallpaper.service'
import { Spinner } from '@/components/ui/spinner'
import { RefreshCw, Download } from 'lucide-react'

interface Props {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  title: string
}

const STYLE_TAGS = [
  "Cinematic",
  "Studio Ghibli",
  "Cyberpunk",
  "Minimalist",
  "Synthwave",
  "Oil Painting",
  "Watercolor",
  "Dark Fantasy"
]

export function WallpaperGenerator({ tmdbId, mediaType, title }: Props) {
  const [loadingDesktop, setLoadingDesktop] = useState(false)
  const [loadingMobile, setLoadingMobile] = useState(false)
  const [desktopUrl, setDesktopUrl] = useState<string | null>(null)
  const [mobileUrl, setMobileUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [activeTag, setActiveTag] = useState<string>(STYLE_TAGS[0])

  const handleGenerate = async (type: 'desktop' | 'mobile', forceRegenerate: boolean = false) => {
    setError('')
    if (type === 'desktop') setLoadingDesktop(true)
    else setLoadingMobile(true)

    try {
      const res = await generateWallpaper(tmdbId, mediaType, title, type, activeTag, forceRegenerate)
      if (res.error) {
        setError(res.error)
      } else if (res.url) {
        if (type === 'desktop') setDesktopUrl(res.url)
        else setMobileUrl(res.url)
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate')
    } finally {
      if (type === 'desktop') setLoadingDesktop(false)
      else setLoadingMobile(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {error && <p className="text-red-500 bg-red-950/50 p-4 rounded border border-red-900">{error}</p>}
      
      {/* Style Tags Selector */}
      <div className="flex flex-col gap-3">
        <h3 className="text-white font-medium text-lg">Choose an Art Style</h3>
        <div className="flex flex-wrap gap-2">
          {STYLE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTag === tag 
                  ? 'bg-zinc-100 text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="text-zinc-500 text-sm mt-1">Select a style to customize the AI generation (powered by Flux).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Desktop Wallpaper */}
        <div className="flex flex-col gap-4 items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-sm transition-all hover:bg-zinc-900/80">
          <h3 className="text-white font-medium text-lg">Desktop (16:9)</h3>
          {desktopUrl ? (
            <div className="flex flex-col gap-4 w-full items-center">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-zinc-700/50 group">
                <img src={desktopUrl} alt="Desktop wallpaper" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a href={desktopUrl} target="_blank" rel="noreferrer" download className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-100 text-zinc-900 hover:bg-white h-10 px-6 font-medium">
                    <Download size={18} /> Download
                  </a>
                </div>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <Button 
                  onClick={() => handleGenerate('desktop', true)} 
                  disabled={loadingDesktop}
                  variant="outline"
                  className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  {loadingDesktop ? <Spinner className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {loadingDesktop ? 'Generating...' : 'Regenerate'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
              <div className="w-full aspect-video rounded-xl bg-zinc-950/50 border border-zinc-800/50 flex items-center justify-center text-zinc-600 shadow-inner">
                Ready to generate
              </div>
              <Button 
                onClick={() => handleGenerate('desktop')} 
                disabled={loadingDesktop}
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-300 w-full rounded-full h-10 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {loadingDesktop ? <Spinner className="w-5 h-5 mr-2" /> : null}
                {loadingDesktop ? 'Generating...' : 'Generate High-Res'}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Wallpaper */}
        <div className="flex flex-col gap-4 items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-sm transition-all hover:bg-zinc-900/80">
          <h3 className="text-white font-medium text-lg">Mobile (9:16)</h3>
          {mobileUrl ? (
            <div className="flex flex-col gap-4 w-full items-center">
              <div className="relative w-[60%] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-zinc-700/50 mx-auto group">
                <img src={mobileUrl} alt="Mobile wallpaper" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                  <a href={mobileUrl} target="_blank" rel="noreferrer" download className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-100 text-zinc-900 hover:bg-white h-10 px-6 font-medium">
                    <Download size={18} /> Save
                  </a>
                </div>
              </div>
              <div className="flex w-full gap-3 mt-2 justify-center px-4">
                <Button 
                  onClick={() => handleGenerate('mobile', true)} 
                  disabled={loadingMobile}
                  variant="outline"
                  className="flex-1 max-w-[200px] bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  {loadingMobile ? <Spinner className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {loadingMobile ? 'Generating...' : 'Regenerate'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
              <div className="w-[60%] aspect-[9/16] rounded-xl bg-zinc-950/50 border border-zinc-800/50 flex items-center justify-center text-zinc-600 mx-auto shadow-inner">
                Ready to generate
              </div>
              <Button 
                onClick={() => handleGenerate('mobile')} 
                disabled={loadingMobile}
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-300 w-full max-w-[200px] rounded-full h-10 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {loadingMobile ? <Spinner className="w-5 h-5 mr-2" /> : null}
                {loadingMobile ? 'Generating...' : 'Generate High-Res'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
