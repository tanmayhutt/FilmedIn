import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bookmark, Check, Clapperboard, Copy, Heart, Library, Tv, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTasteBlend } from '@/services/playlist.service'
import { MediaCard } from '@/components/features/MediaCard'

type BlendItem = Record<string, unknown> & { id: number }
type CategoryBreakdown = { u1Count?: number; u2Count?: number; mutualCount?: number }
type BlendData = {
  currentUser: { username: string; avatarUrl?: string }
  targetUser: { username: string; avatarUrl?: string }
  matchPercentage: number
  synergyTier: string
  totalSharedCount: number
  presetBreakdown?: Record<string, CategoryBreakdown>
  toWatchTogether?: BlendItem[]
  bothCompleted?: BlendItem[]
  recommendations?: BlendItem[]
  error?: string
}

function Avatar({ user }: { user: BlendData['currentUser'] }) {
  return <div className="h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">{user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-zinc-500"><User className="h-6 w-6" /></div>}</div>
}

function MediaShelf({ title, description, items, empty }: { title: string; description: string; items: BlendItem[]; empty: string }) {
  return <section className="space-y-5"><div className="flex flex-col justify-between gap-2 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-end"><h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2><p className="max-w-lg text-xs leading-5 text-zinc-500">{description}</p></div>{items.length ? <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">{items.map((item) => <MediaCard key={item.id} media={item as never} />)}</div> : <div className="rounded-xl border border-dashed border-white/10 px-5 py-9 text-center text-sm text-zinc-500">{empty}</div>}</section>
}

export default function TasteBlend() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<BlendData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!username) return
    setLoading(true)
    getTasteBlend(username).then((result) => result.error ? setError(result.error) : setData(result)).catch(() => setError('The comparison could not be loaded.')).finally(() => setLoading(false))
  }, [username])

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast.success('Blend link copied') }
    catch { toast.error('Could not copy the link') }
  }

  if (loading) return <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-zinc-500"><span className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#d2b48c]" /><p className="text-sm">Comparing both libraries</p></div>
  if (!data || error) return <div className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="text-2xl font-semibold">Blend unavailable</h1><p className="mt-3 text-sm text-zinc-500">{error || 'This comparison is unavailable.'}</p><button onClick={() => navigate(-1)} className="mt-7 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">Go back</button></div>

  const categories = [
    { key: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { key: 'currentlyWatching', label: 'Watching', icon: Tv },
    { key: 'watched', label: 'Watched', icon: Check },
    { key: 'liked', label: 'Liked', icon: Heart },
  ]
  const watchTogether = data.toWatchTogether || []
  const completed = data.bothCompleted || []
  const recommendations = data.recommendations || []

  return <main className="mx-auto w-full max-w-6xl space-y-14 px-4 py-8 sm:px-6 sm:py-12">
    <header className="flex items-center justify-between border-b border-white/[0.08] pb-5"><button onClick={() => navigate(`/u/${username}`)} className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-white"><ArrowLeft className="h-4 w-4" />Back to @{username}</button><button onClick={copyLink} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"><Copy className="h-3.5 w-3.5" />Copy link</button></header>

    <section className="grid gap-8 rounded-[1.5rem] border border-white/[0.08] bg-[#171817] p-6 sm:p-10 lg:grid-cols-[1fr_220px] lg:items-center"><div><div className="flex items-center gap-4"><Avatar user={data.currentUser} /><span className="text-zinc-600">and</span><Avatar user={data.targetUser} /></div><p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#d2b48c]">Taste Blend</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">{data.currentUser.username} and {data.targetUser.username}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">A direct comparison of saved titles. The score is the percentage of the combined library that appears in both collections.</p></div><div className="border-t border-white/[0.08] pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"><p className="text-6xl font-semibold tracking-[-0.06em] text-[#e8e0d3]">{data.matchPercentage}<span className="text-2xl text-zinc-600">%</span></p><p className="mt-2 text-sm font-medium text-zinc-300">{data.synergyTier}</p><p className="mt-1 text-xs text-zinc-600">{data.totalSharedCount} shared titles</p></div></section>

    <section><div className="mb-5 flex items-center gap-2"><Library className="h-4 w-4 text-zinc-500" /><h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400">Library overlap</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{categories.map(({ key, label, icon: Icon }) => { const category = data.presetBreakdown?.[key] || {}; return <div key={key} className="rounded-xl border border-white/[0.08] bg-[#171817] p-5"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-medium text-zinc-300"><Icon className="h-4 w-4 text-zinc-500" />{label}</span><strong className="text-lg font-semibold text-white">{category.mutualCount || 0}</strong></div><div className="mt-5 flex justify-between border-t border-white/[0.07] pt-3 text-[11px] text-zinc-600"><span>You {category.u1Count || 0}</span><span>Them {category.u2Count || 0}</span></div></div> })}</div></section>

    <section className="rounded-[1.5rem] border border-[#d2b48c]/20 bg-[#d2b48c]/[0.045] p-6 sm:p-8"><div className="flex items-start gap-4"><Clapperboard className="mt-1 h-5 w-5 shrink-0 text-[#d2b48c]" /><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d2b48c]">Watch together</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">{watchTogether.length ? `${watchTogether.length} shared pending ${watchTogether.length === 1 ? 'title' : 'titles'}` : 'Nothing pending in both libraries yet'}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">A title appears here when both of you have it in Watchlist or Watching. Moving a title to Watched removes it from this queue and places it in your shared history.</p></div></div></section>

    <MediaShelf title="Ready to watch together" description="Pending for both of you, whether saved in Watchlist or currently Watching." items={watchTogether} empty="Add the same film or show to both watchlists and it will appear here." />
    <MediaShelf title="Shared history" description="Films and shows both people have marked as Watched." items={completed} empty="You have not completed the same title yet." />
    <MediaShelf title={`From ${data.targetUser.username}'s library`} description="Titles they saved that are not currently in your library." items={recommendations} empty="There are no new titles to recommend from this library yet." />
  </main>
}
