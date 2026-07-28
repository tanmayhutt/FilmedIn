import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTasteBlend } from '@/services/playlist.service'
import { MediaCard } from '@/components/features/MediaCard'
import { ArrowLeft, Sparkles, User, Bookmark, Tv, CheckCircle2, FolderHeart, Compass, Share2, Film, Clapperboard, Layers } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TasteBlend() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()

  const [blendData, setBlendData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    setLoading(true)
    setError(null)
    getTasteBlend(username)
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setBlendData(data)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch blend data', err)
        setError('Failed to load taste comparison')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [username])

  const handleShareBlend = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
        <div className="relative w-16 h-16 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-800 border-t-zinc-300 animate-spin" />
          <Clapperboard className="w-6 h-6 text-zinc-400" />
        </div>
        <h2 className="text-lg font-medium text-zinc-300 tracking-wide">
          Analyzing Cinematic Alignment...
        </h2>
        <p className="text-zinc-500 text-xs mt-1">Comparing libraries with @{username}</p>
      </div>
    )
  }

  if (error || !blendData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Comparison Unavailable</h2>
        <p className="text-zinc-400 text-sm mb-6">{error || 'Could not load blend comparison.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors text-xs font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return
        </button>
      </div>
    )
  }

  const matchPercent = blendData.matchPercentage || 75
  const toWatchTogether = blendData.toWatchTogether || []
  const bothCompleted = blendData.bothCompleted || []
  const recommendations = blendData.recommendations || []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12 text-zinc-100">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <button
          onClick={() => navigate(`/u/${username}`)}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to @{username}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Taste Alignment</span>
          <button
            onClick={handleShareBlend}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* Editorial Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-8 sm:p-12 flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950/60 pointer-events-none" />

        {/* User Badges */}
        <div className="flex items-center justify-center -space-x-3 mb-6 relative">
          <div className="w-16 h-16 rounded-full border-2 border-zinc-700 overflow-hidden bg-zinc-950 shadow-xl shrink-0 z-10">
            {blendData.currentUser?.avatarUrl ? (
              <img src={blendData.currentUser.avatarUrl} alt={blendData.currentUser.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-900"><User size={28} /></div>
            )}
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-zinc-300 z-20 text-xs font-mono">
            ×
          </div>
          <div className="w-16 h-16 rounded-full border-2 border-zinc-700 overflow-hidden bg-zinc-950 shadow-xl shrink-0 z-10">
            {blendData.targetUser?.avatarUrl ? (
              <img src={blendData.targetUser.avatarUrl} alt={blendData.targetUser.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-900"><User size={28} /></div>
            )}
          </div>
        </div>

        {/* Compatibility Tag & Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-xs font-mono uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> {matchPercent}% Compatibility · {blendData.synergyTier}
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">
          {blendData.currentUser.username} & {blendData.targetUser.username}
        </h1>

        <p className="text-zinc-400 text-xs sm:text-sm max-w-lg leading-relaxed">
          {blendData.totalSharedCount > 0
            ? `Libraries show ${blendData.totalSharedCount} overlapping titles across watchlists and custom collections.`
            : `Distinct viewing preferences — explore individual libraries for cross-discovery.`}
        </p>

        {/* Minimal Progress Bar */}
        <div className="w-full max-w-sm mt-6 bg-zinc-950 border border-zinc-800 rounded-full h-2 p-0.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-zinc-300 transition-all duration-1000 opacity-90"
            style={{ width: `${matchPercent}%` }}
          />
        </div>
      </div>

      {/* Library Metrics Comparison */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-400" /> Library Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Watchlist */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium flex items-center gap-1.5 text-zinc-300">
                <Bookmark className="w-3.5 h-3.5 text-zinc-400" /> Watchlist
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {blendData.presetBreakdown?.watchlist?.mutualCount || 0} Mutual
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
              <span>You: <strong className="text-zinc-300">{blendData.presetBreakdown?.watchlist?.u1Count}</strong></span>
              <span>@{username}: <strong className="text-zinc-300">{blendData.presetBreakdown?.watchlist?.u2Count}</strong></span>
            </div>
          </div>

          {/* Currently Watching */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium flex items-center gap-1.5 text-zinc-300">
                <Tv className="w-3.5 h-3.5 text-zinc-400" /> Watching
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {blendData.presetBreakdown?.currentlyWatching?.mutualCount || 0} Mutual
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
              <span>You: <strong className="text-zinc-300">{blendData.presetBreakdown?.currentlyWatching?.u1Count}</strong></span>
              <span>@{username}: <strong className="text-zinc-300">{blendData.presetBreakdown?.currentlyWatching?.u2Count}</strong></span>
            </div>
          </div>

          {/* Watched History */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" /> Watched
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {blendData.presetBreakdown?.watched?.mutualCount || 0} Mutual
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
              <span>You: <strong className="text-zinc-300">{blendData.presetBreakdown?.watched?.u1Count}</strong></span>
              <span>@{username}: <strong className="text-zinc-300">{blendData.presetBreakdown?.watched?.u2Count}</strong></span>
            </div>
          </div>

          {/* Custom Playlists */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium flex items-center gap-1.5 text-zinc-300">
                <FolderHeart className="w-3.5 h-3.5 text-zinc-400" /> Custom Lists
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {blendData.customBreakdown?.mutualCount || 0} Mutual
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
              <span>You: <strong className="text-zinc-300">{blendData.customBreakdown?.u1CustomCount} lists</strong></span>
              <span>@{username}: <strong className="text-zinc-300">{blendData.customBreakdown?.u2CustomCount} lists</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Shared Watchlist (Pending in Both Libraries) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-zinc-400" /> Shared Watchlist ({toWatchTogether.length})
          </h3>
          <p className="text-xs text-zinc-500">Titles pending in both libraries</p>
        </div>

        {toWatchTogether.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {toWatchTogether.map((item: any) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
        ) : (
          <div className="py-8 px-4 text-center text-xs text-zinc-500 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800/60 italic">
            No pending watchlists in common. Add upcoming films & shows to your Watchlist to find overlap.
          </div>
        )}
      </div>

      {/* SECTION 2: Mutual Completed (Watched by Both) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-zinc-400" /> Mutual Completed ({bothCompleted.length})
          </h3>
          <p className="text-xs text-zinc-500">Titles watched by both users</p>
        </div>

        {bothCompleted.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {bothCompleted.map((item: any) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
        ) : (
          <div className="py-8 px-4 text-center text-xs text-zinc-500 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800/60 italic">
            No completed titles shared in watched history yet.
          </div>
        )}
      </div>

      {/* SECTION 3: Curated Discoveries (From @username's Library) */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-zinc-400" /> Curated Discoveries ({recommendations.length})
            </h3>
            <p className="text-xs text-zinc-500">Titles from @{username}'s library to explore</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {recommendations.map((item: any) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
