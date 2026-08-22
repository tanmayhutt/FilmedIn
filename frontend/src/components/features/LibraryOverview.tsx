import { ArrowRight, Bookmark, CheckCircle2, Heart, PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PlaylistCover } from './PlaylistCover'

type Playlist = {
  id: string
  name: string
  type: 'system' | 'custom'
  playlist_items?: { count: number }[]
  preview_posters?: string[]
}

const SYSTEM_COLLECTIONS = [
  {
    name: 'Currently Watching',
    label: 'In progress',
    description: 'Pick up where you left off.',
    icon: PlayCircle,
  },
  {
    name: 'Watchlist',
    label: 'Up next',
    description: 'Movies and shows saved for later.',
    icon: Bookmark,
  },
  {
    name: 'Watched',
    label: 'Completed',
    description: 'Your complete viewing history.',
    icon: CheckCircle2,
  },
  {
    name: 'Liked',
    label: 'Favourites',
    description: 'The titles that stayed with you.',
    icon: Heart,
  },
]

function getCount(playlist?: Playlist) {
  return playlist?.playlist_items?.[0]?.count || 0
}

export function LibraryOverview({ playlists, username, isOwner }: { playlists: Playlist[], username: string, isOwner: boolean }) {
  const systemPlaylists = SYSTEM_COLLECTIONS.map(collection => ({
    ...collection,
    playlist: playlists.find(playlist => playlist.type === 'system' && playlist.name === collection.name),
  }))

  const trackedCount = systemPlaylists
    .filter(collection => collection.name !== 'Liked')
    .reduce((total, collection) => total + getCount(collection.playlist), 0)
  const completedCount = getCount(systemPlaylists.find(collection => collection.name === 'Watched')?.playlist)
  const completionRate = trackedCount > 0 ? Math.round((completedCount / trackedCount) * 100) : 0

  return (
    <section className="space-y-4" aria-labelledby="library-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Library</p>
          <h2 id="library-heading" className="mt-1 text-2xl font-bold tracking-tight text-white">{isOwner ? 'Your viewing lists' : `${username}'s viewing lists`}</h2>
          <p className="mt-1 text-sm text-zinc-500">Four simple states for every movie and show.</p>
        </div>
        <p className="text-xs text-zinc-500"><span className="font-bold text-zinc-200">{trackedCount}</span> tracked · <span className="font-bold text-zinc-200">{completedCount}</span> completed · <span className="font-bold text-zinc-200">{completionRate}%</span> progress</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#171817]">
        <div className="divide-y divide-white/[0.07]">
          {systemPlaylists.map(({ name, label, description, icon: Icon, playlist }) => {
            const count = getCount(playlist)
            const content = (
              <>
                <PlaylistCover posters={playlist?.preview_posters} fallback={Icon} className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><h3 className="font-bold text-zinc-100">{name}</h3><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">{label}</span></div>
                  <p className="mt-1 truncate text-xs text-zinc-500">{description}</p>
                </div>
                <span className="min-w-16 text-right text-sm font-bold text-zinc-200">{count} {count === 1 ? 'title' : 'titles'}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-white" aria-hidden="true" />
              </>
            )

            return playlist ? (
              <Link key={name} to={`/playlist/${playlist.id}`} className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-white/[0.035] sm:px-5">
                {content}
              </Link>
            ) : (
              <div key={name} className="flex items-center gap-4 px-4 py-4 opacity-60 sm:px-5">
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
