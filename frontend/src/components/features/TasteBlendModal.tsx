'use client'

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTasteBlend } from '@/services/playlist.service'
import { X, Sparkles, User, Heart, Film, Bookmark, Tv, CheckCircle2, FolderHeart, Compass } from 'lucide-react'

interface Props {
  targetUsername: string
  isOpen: boolean
  onClose: () => void
}

export function TasteBlendModal({ targetUsername, isOpen, onClose }: Props) {
  const [blendData, setBlendData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (isOpen && targetUsername) {
      setLoading(true)
      getTasteBlend(targetUsername).then((data) => {
        setBlendData(data)
        setLoading(false)
      })
    }
  }, [isOpen, targetUsername])

  if (!isOpen) return null

  const renderMediaGrid = (items: any[], title: string, emptyMessage: string) => {
    if (!items || items.length === 0) {
      return (
        <div className="py-6 px-4 text-center text-xs text-zinc-400 clay-card italic">
          {emptyMessage}
        </div>
      )
    }
    return (
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {items.map((item: any) => (
          <Link
            key={item.tmdbId}
            to={`/${item.mediaType}/${item.tmdbId}`}
            onClick={onClose}
            className="group relative aspect-[2/3] clay-poster overflow-hidden bg-[#171817]"
          >
            {item.posterPath ? (
              <img src={item.posterPath} alt="Poster" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-[10px] p-2 text-center">No Poster</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span className="text-[10px] font-bold text-white capitalize">{item.mediaType}</span>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="clay-modal w-full max-w-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-transparent">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-zinc-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">Taste Blend</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full clay-badge text-zinc-400 hover:text-white flex items-center justify-center text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-[#d2b48c] animate-spin" />
                <Sparkles className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-zinc-300 text-sm font-medium animate-pulse">Blending Watchlists & Playlists...</p>
            </div>
          ) : blendData ? (
            <>
              {/* Blend Match Hero Card */}
              <div className="relative overflow-hidden clay-card p-8 flex flex-col items-center text-center">
                {/* Avatars */}
                <div className="flex items-center justify-center -space-x-4 mb-5 relative">
                  <div className="w-16 h-16 rounded-full clay-badge overflow-hidden bg-[var(--theme-bg)] shadow-2xl shrink-0 z-10">
                    {blendData.currentUser?.avatarUrl ? (
                      <img src={blendData.currentUser.avatarUrl} alt={blendData.currentUser.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400"><User size={24} /></div>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full clay-badge-blue flex items-center justify-center text-white font-black z-20 text-xs">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                  <div className="w-16 h-16 rounded-full clay-badge overflow-hidden bg-[var(--theme-bg)] shadow-2xl shrink-0 z-10">
                    {blendData.targetUser?.avatarUrl ? (
                      <img src={blendData.targetUser.avatarUrl} alt={blendData.targetUser.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400"><User size={24} /></div>
                    )}
                  </div>
                </div>

                {/* Synergy Tier & Score */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 clay-badge-blue text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> {blendData.matchPercentage}% Taste Match — {blendData.synergyTier}
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                  {blendData.currentUser.username} & {blendData.targetUser.username}
                </h3>
                <p className="text-zinc-300 text-xs max-w-md">
                  {blendData.totalSharedCount > 0
                    ? `You both share ${blendData.totalSharedCount} titles across your preset watchlists and custom playlists!`
                    : `You have distinct movie & TV show preferences — explore each other's lists to discover new titles!`}
                </p>
              </div>

              {/* Preset & Custom Category Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Watchlist */}
                <div className="clay-card p-3.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span className="font-semibold flex items-center gap-1.5"><Bookmark className="w-3.5 h-3.5 text-zinc-500" /> Watchlist</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {blendData.presetBreakdown?.watchlist?.mutualCount || 0} <span className="text-xs font-normal text-zinc-400">Shared</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    You: {blendData.presetBreakdown?.watchlist?.u1Count} · Them: {blendData.presetBreakdown?.watchlist?.u2Count}
                  </div>
                </div>

                {/* Currently Watching */}
                <div className="bg-[var(--theme-dark)]/60 border border-white/10 rounded-xl p-3.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span className="font-semibold flex items-center gap-1.5"><Tv className="w-3.5 h-3.5 text-zinc-500" /> Watching</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {blendData.presetBreakdown?.currentlyWatching?.mutualCount || 0} <span className="text-xs font-normal text-zinc-500">Shared</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    You: {blendData.presetBreakdown?.currentlyWatching?.u1Count} · Them: {blendData.presetBreakdown?.currentlyWatching?.u2Count}
                  </div>
                </div>

                {/* Watched History */}
                <div className="bg-[var(--theme-dark)]/60 border border-white/10 rounded-xl p-3.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span className="font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" /> Watched</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {blendData.presetBreakdown?.watched?.mutualCount || 0} <span className="text-xs font-normal text-zinc-500">Shared</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    You: {blendData.presetBreakdown?.watched?.u1Count} · Them: {blendData.presetBreakdown?.watched?.u2Count}
                  </div>
                </div>

                {/* Custom Playlists */}
                <div className="bg-[var(--theme-dark)]/60 border border-white/10 rounded-xl p-3.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span className="font-semibold flex items-center gap-1.5"><FolderHeart className="w-3.5 h-3.5 text-zinc-500" /> Custom Lists</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {blendData.customBreakdown?.mutualCount || 0} <span className="text-xs font-normal text-zinc-500">Shared</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    You: {blendData.customBreakdown?.u1CustomCount} lists · Them: {blendData.customBreakdown?.u2CustomCount} lists
                  </div>
                </div>
              </div>

              {/* All Mutual Titles */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Film className="w-4 h-4 text-zinc-500" /> Mutual Saved Titles ({blendData.allMutualItems?.length || 0})
                </h4>
                {renderMediaGrid(
                  blendData.allMutualItems,
                  'Mutual Saved Titles',
                  'No shared titles found yet. Start adding movies & shows to your lists to discover matches!'
                )}
              </div>

              {/* Recommendations for You */}
              {blendData.recommendations && blendData.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-zinc-500" /> Recommended from @{blendData.targetUser.username}'s Lists
                  </h4>
                  {renderMediaGrid(
                    blendData.recommendations,
                    'Recommended Titles',
                    'No unique recommendations available.'
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-zinc-500">Failed to load taste blend data.</div>
          )}
        </div>
      </div>
    </div>
  )
}
