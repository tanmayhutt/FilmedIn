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
        {/* Desktop Wallpaper Section */}
        <div className="flex flex-col justify-between items-center bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-sm transition-all hover:bg-zinc-900/50">
          <h3 className="text-white font-medium text-lg mb-6">Desktop (16:9)</h3>
          
          {/* Laptop Silhouette Mockup */}
          <div className="relative w-full max-w-[450px] mx-auto mb-8">
            {/* Screen */}
            <div className="relative w-full aspect-video rounded-t-xl border-[8px] border-b-[12px] border-zinc-950 bg-zinc-950 shadow-2xl flex items-center justify-center overflow-hidden group">
              {/* Camera dot */}
              <div className="absolute top-1 inset-x-0 flex justify-center z-10">
                <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
              </div>
              
              {/* Content */}
              {desktopUrl ? (
                <>
                  <img src={desktopUrl} alt="Desktop wallpaper" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                    <a href={desktopUrl} target="_blank" rel="noreferrer" download className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 h-10 px-6 font-medium shadow-xl">
                      <Download size={18} /> Download
                    </a>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-zinc-900/50 flex flex-col items-center justify-center shadow-inner text-zinc-500">
                  <span className="text-sm font-medium">Ready</span>
                </div>
              )}
            </div>
            {/* Keyboard Base */}
            <div className="relative w-[110%] -ml-[5%] h-3 bg-zinc-700 rounded-b-xl rounded-t-sm flex justify-center shadow-2xl overflow-hidden border-t border-zinc-600">
              <div className="w-1/4 h-1.5 bg-zinc-600 rounded-b-md"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full max-w-[450px] gap-3 mt-auto">
            {desktopUrl ? (
              <Button 
                onClick={() => handleGenerate('desktop', true)} 
                disabled={loadingDesktop}
                variant="outline"
                className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-full h-12"
              >
                {loadingDesktop ? <Spinner className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                {loadingDesktop ? 'Generating...' : 'Regenerate'}
              </Button>
            ) : (
              <Button 
                onClick={() => handleGenerate('desktop')} 
                disabled={loadingDesktop}
                className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 rounded-full h-12 shadow-[0_0_20px_rgba(255,255,255,0.1)] font-medium text-base"
              >
                {loadingDesktop ? <Spinner className="w-5 h-5 mr-2" /> : null}
                {loadingDesktop ? 'Generating...' : 'Generate Wallpaper'}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Wallpaper Section */}
        <div className="flex flex-col justify-between items-center bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-sm transition-all hover:bg-zinc-900/50">
          <h3 className="text-white font-medium text-lg mb-6">Mobile (9:16)</h3>
          
          {/* Phone Silhouette Mockup */}
          <div className="relative w-full max-w-[200px] mx-auto mb-8">
            <div className="relative w-full aspect-[9/19.5] rounded-[2.5rem] border-[10px] border-zinc-950 bg-zinc-950 shadow-2xl flex items-center justify-center overflow-hidden group">
              {/* Dynamic Island */}
              <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-20">
                <div className="w-[35%] h-full bg-zinc-950 rounded-b-xl"></div>
              </div>
              
              {/* Content */}
              {mobileUrl ? (
                <>
                  <img src={mobileUrl} alt="Mobile wallpaper" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
                    <a href={mobileUrl} target="_blank" rel="noreferrer" download className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 h-10 px-5 font-medium shadow-xl">
                      <Download size={18} /> Save
                    </a>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-zinc-900/50 flex flex-col items-center justify-center shadow-inner text-zinc-500">
                  <span className="text-xs font-medium">Ready</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full max-w-[200px] gap-3 mt-auto">
            {mobileUrl ? (
              <Button 
                onClick={() => handleGenerate('mobile', true)} 
                disabled={loadingMobile}
                variant="outline"
                className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-full h-12"
              >
                {loadingMobile ? <Spinner className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                {loadingMobile ? 'Generating...' : 'Regenerate'}
              </Button>
            ) : (
              <Button 
                onClick={() => handleGenerate('mobile')} 
                disabled={loadingMobile}
                className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 rounded-full h-12 shadow-[0_0_20px_rgba(255,255,255,0.1)] font-medium text-base"
              >
                {loadingMobile ? <Spinner className="w-5 h-5 mr-2" /> : null}
                {loadingMobile ? 'Generating...' : 'Generate'}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
