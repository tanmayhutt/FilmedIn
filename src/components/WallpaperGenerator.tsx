'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateWallpaper } from '@/app/actions/wallpapers'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'

interface Props {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  title: string
}

export function WallpaperGenerator({ tmdbId, mediaType, title }: Props) {
  const [loadingDesktop, setLoadingDesktop] = useState(false)
  const [loadingMobile, setLoadingMobile] = useState(false)
  const [desktopUrl, setDesktopUrl] = useState<string | null>(null)
  const [mobileUrl, setMobileUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = async (type: 'desktop' | 'mobile') => {
    setError('')
    if (type === 'desktop') setLoadingDesktop(true)
    else setLoadingMobile(true)

    try {
      const res = await generateWallpaper(tmdbId, mediaType, title, type)
      if (type === 'desktop') setDesktopUrl(res.url)
      else setMobileUrl(res.url)
    } catch (e: any) {
      setError(e.message || 'Failed to generate')
    } finally {
      if (type === 'desktop') setLoadingDesktop(false)
      else setLoadingMobile(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {error && <p className="text-red-500 bg-red-950/50 p-4 rounded border border-red-900">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Desktop Wallpaper */}
        <div className="flex flex-col gap-4 items-center bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h3 className="text-white font-medium text-lg">Desktop (16:9)</h3>
          {desktopUrl ? (
            <div className="flex flex-col gap-4 w-full items-center">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-700">
                <Image src={desktopUrl} alt="Desktop wallpaper" fill className="object-cover" />
              </div>
              <a href={desktopUrl} target="_blank" rel="noreferrer" download className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-zinc-100 text-zinc-900 hover:bg-zinc-300 h-9 px-4 py-2 w-auto">
                Download High-Res
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="w-full aspect-video rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600">
                No wallpaper yet
              </div>
              <Button 
                onClick={() => handleGenerate('desktop')} 
                disabled={loadingDesktop}
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-300 w-full"
              >
                {loadingDesktop ? <Spinner className="w-5 h-5 mr-2" /> : null}
                {loadingDesktop ? 'Generating...' : 'Generate Desktop Wallpaper'}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Wallpaper */}
        <div className="flex flex-col gap-4 items-center bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h3 className="text-white font-medium text-lg">Mobile (9:16)</h3>
          {mobileUrl ? (
            <div className="flex flex-col gap-4 w-full items-center">
              <div className="relative w-[56%] aspect-[9/16] rounded-lg overflow-hidden border border-zinc-700 mx-auto">
                <Image src={mobileUrl} alt="Mobile wallpaper" fill className="object-cover" />
              </div>
              <a href={mobileUrl} target="_blank" rel="noreferrer" download className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-zinc-100 text-zinc-900 hover:bg-zinc-300 h-9 px-4 py-2 w-auto">
                Download High-Res
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="w-[56%] aspect-[9/16] rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 mx-auto">
                No wallpaper yet
              </div>
              <Button 
                onClick={() => handleGenerate('mobile')} 
                disabled={loadingMobile}
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-300 w-full"
              >
                {loadingMobile ? <Spinner className="w-5 h-5 mr-2" /> : null}
                {loadingMobile ? 'Generating...' : 'Generate Mobile Wallpaper'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
