'use client'

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { generateWallpaper } from '@/services/wallpaper.service'
import { Spinner } from '@/components/ui/spinner'
import { RefreshCw, Download, Moon, Sun, Lock, X } from 'lucide-react'
import { hasSessionHint } from '@/utils/auth'

interface Props {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  title: string
}

const STYLE_TAGS = [
  "Cinematic Landscape",
  "Paper Cutout",
  "Fluid Grain",
  "Abstract Bauhaus",
  "Neon Retro-Wave",
  "Linear Mesh",
  "Glassmorphism"
]

export function WallpaperGenerator({ tmdbId, mediaType, title }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(hasSessionHint())
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loadingDesktop, setLoadingDesktop] = useState(false)
  const [loadingMobile, setLoadingMobile] = useState(false)
  const [desktopUrl, setDesktopUrl] = useState<string | null>(null)
  const [mobileUrl, setMobileUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [activeTag, setActiveTag] = useState<string>(STYLE_TAGS[0])
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const syncAuthentication = () => setIsLoggedIn(hasSessionHint())
    syncAuthentication()
    window.addEventListener('auth-changed', syncAuthentication)
    return () => window.removeEventListener('auth-changed', syncAuthentication)
  }, [])

  const handleGenerate = async (type: 'desktop' | 'mobile', forceRegenerate: boolean = false, currentTag: string = activeTag, currentTheme: 'dark' | 'light' = themeMode) => {
    // Gate: if not logged in, show login prompt instead
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    setError('')
    if (type === 'desktop') setLoadingDesktop(true)
    else setLoadingMobile(true)

    try {
      const res = await generateWallpaper(tmdbId, mediaType, title, type, currentTag, currentTheme, forceRegenerate)
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

  // Generate one preview at a time to avoid expensive duplicate server work.
  useEffect(() => {
    if (!isLoggedIn) return
    handleGenerate('desktop', true, activeTag, themeMode)
    setMobileUrl(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag, themeMode, tmdbId, isLoggedIn])

  return (
    <div className="flex flex-col gap-8 w-full">
      {error && <p className="text-red-500 bg-red-950/50 p-4 rounded border border-red-900">{error}</p>}

      {/* Login Prompt Banner */}
      {showLoginPrompt && (
        <div className="relative flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-white/20 bg-[var(--theme-dark)]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--theme-dark-hover)] shrink-0">
              <Lock className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Sign in to generate wallpapers</p>
              <p className="text-zinc-500 text-xs mt-0.5">Create a free account to unlock palette-based wallpaper generation.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/login"
              className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
            >
              Sign in with Google
            </Link>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="ml-1 text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Configuration Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-1">
          <div>
            <h3 className="text-white font-medium text-lg">Cinematic Wallpaper Studio</h3>
            <p className="text-zinc-500 text-sm mt-1">Create an original wallpaper from the title's visual palette, from calm scenery to expressive abstraction.</p>
          </div>
          
          {/* Theme Toggle */}
          <div className="flex bg-[var(--theme-dark)] rounded-full p-1 border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setThemeMode('dark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                themeMode === 'dark' ? 'bg-[var(--theme-dark-hover)] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Moon size={14} /> Dark
            </button>
            <button
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                themeMode === 'light' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sun size={14} /> Light
            </button>
          </div>
        </div>

        {/* Style Tags Selector */}
        <div className="flex flex-wrap gap-2">
          {STYLE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTag === tag 
                  ? 'bg-zinc-100 text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105' 
                  : 'bg-[var(--theme-dark)] border border-white/10 text-zinc-400 hover:bg-[var(--theme-dark-hover)] hover:text-zinc-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Desktop Wallpaper Section */}
        <div className="flex flex-col justify-between items-center bg-[var(--theme-dark)]/30 p-8 rounded-3xl border border-white/10/50 backdrop-blur-sm transition-all hover:bg-[var(--theme-dark)]/50">
          <h3 className="text-white font-medium text-lg mb-6">Desktop (16:9)</h3>
          
          {/* Laptop Silhouette Mockup */}
          <div className="relative w-full max-w-[450px] mx-auto mb-8">
            {/* Screen */}
            <div className="relative w-full aspect-video rounded-t-xl border-[4px] border-b-[12px] border-zinc-950 bg-[var(--theme-bg)] shadow-2xl flex items-center justify-center overflow-hidden group">
              {/* MacBook Notch */}
              <div className="absolute top-0 inset-x-0 mx-auto w-[12%] h-[12px] bg-[var(--theme-bg)] rounded-b-md z-20 flex justify-center items-center pb-[2px]">
                <div className="w-[4px] h-[4px] bg-[var(--theme-dark-hover)] rounded-full border border-black/50 shadow-inner"></div>
              </div>
              
              {/* Content */}
              {desktopUrl ? (
                <>
                  <img src={desktopUrl} alt="Desktop wallpaper" className={`w-full h-full object-cover transition-all duration-700 ${loadingDesktop ? 'opacity-50 blur-sm scale-110' : 'opacity-100 blur-0 group-hover:scale-105'}`} />
                  {isLoggedIn && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                      <a href={desktopUrl} target="_blank" rel="noreferrer" download="filmedin-desktop-wallpaper.png" className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 h-10 px-6 font-medium shadow-xl">
                        <Download size={18} /> Download
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-[var(--theme-dark)]/50 flex flex-col items-center justify-center shadow-inner text-zinc-600">
                  {isLoggedIn ? (
                    <>
                      <Spinner className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium text-zinc-500">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium text-zinc-500">Sign in to preview</span>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Keyboard Base */}
            <div className="relative w-[114%] -ml-[7%] h-2.5 bg-[#2a2a2a] rounded-b-xl rounded-t-sm flex justify-center shadow-2xl overflow-hidden border-t border-[#333]">
              <div className="w-1/4 h-1 bg-[#1a1a1a] rounded-b-md opacity-80"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full max-w-[450px] gap-3 mt-auto">
            <Button 
              onClick={() => handleGenerate('desktop', true)} 
              disabled={loadingDesktop}
              variant="outline"
              className="flex-1 bg-[var(--theme-dark)] border-white/20 text-zinc-300 hover:bg-[var(--theme-dark-hover)] hover:text-white rounded-full h-12"
            >
              {loadingDesktop ? <Spinner className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {loadingDesktop ? 'Shuffling...' : 'Shuffle Scene'}
            </Button>
          </div>
        </div>

        {/* Mobile Wallpaper Section */}
        <div className="flex flex-col justify-between items-center bg-[var(--theme-dark)]/30 p-8 rounded-3xl border border-white/10/50 backdrop-blur-sm transition-all hover:bg-[var(--theme-dark)]/50">
          <h3 className="text-white font-medium text-lg mb-6">Mobile (9:16)</h3>
          
          {/* Phone Silhouette Mockup */}
          <div className="relative w-full max-w-[200px] mx-auto mb-8">
            <div className="relative w-full aspect-[9/19.5] rounded-[2rem] border-[6px] border-zinc-950 bg-[var(--theme-bg)] shadow-2xl flex items-center justify-center overflow-hidden group">
              {/* Dynamic Island */}
              <div className="absolute top-[6px] inset-x-0 mx-auto w-[64px] h-[18px] bg-black rounded-full z-20 flex justify-end items-center px-1.5 shadow-[0_0_1px_rgba(255,255,255,0.1)]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/5 shadow-inner flex justify-center items-center">
                  <div className="w-1 h-1 rounded-full bg-white/20"></div>
                </div>
              </div>
              
              {/* Content */}
              {mobileUrl ? (
                <>
                  <img src={mobileUrl} alt="Mobile wallpaper" className={`w-full h-full object-cover transition-all duration-700 ${loadingMobile ? 'opacity-50 blur-sm scale-110' : 'opacity-100 blur-0 group-hover:scale-105'}`} />
                  {isLoggedIn && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
                      <a href={mobileUrl} target="_blank" rel="noreferrer" download="filmedin-mobile-wallpaper.png" className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 h-10 px-5 font-medium shadow-xl">
                        <Download size={18} /> Download
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-[var(--theme-dark)]/50 flex flex-col items-center justify-center shadow-inner text-zinc-600">
                  {isLoggedIn ? (
                    <>
                      <Spinner className="w-5 h-5 mb-2" />
                      <span className="text-xs font-medium text-zinc-500">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mb-2" />
                      <span className="text-xs font-medium text-zinc-500">Sign in to preview</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full max-w-[200px] gap-3 mt-auto">
            <Button 
              onClick={() => handleGenerate('mobile', true)} 
              disabled={loadingMobile}
              variant="outline"
              className="flex-1 bg-[var(--theme-dark)] border-white/20 text-zinc-300 hover:bg-[var(--theme-dark-hover)] hover:text-white rounded-full h-12"
            >
              {loadingMobile ? <Spinner className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {loadingMobile ? 'Shuffling...' : 'Shuffle Scene'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
