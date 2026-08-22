import { ArrowRight, Bookmark, CheckCircle2, Heart, PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

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
    accent: '#c69b61',
  },
  {
    name: 'Watchlist',
    label: 'Up next',
    description: 'Movies and shows saved for later.',
    icon: Bookmark,
    accent: '#7299c6',
  },
  {
    name: 'Watched',
    label: 'Completed',
    description: 'Your complete viewing history.',
    icon: CheckCircle2,
    accent: '#82ac62',
  },
  {
    name: 'Liked',
    label: 'Favourites',
    description: 'The titles that stayed with you.',
    icon: Heart,
    accent: '#b6789e',
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
    <section className="space-y-5" aria-labelledby="library-heading">
      <div className="clay-card overflow-hidden border border-white/10">
        <div className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d2b48c]">Personal collection</p>
            <h2 id="library-heading" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {isOwner ? 'Your Library' : `${username}'s Library`}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400 sm:text-base">
              Movies and shows together, organised by what is next, in progress, completed, and worth remembering.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/25 p-2 text-center sm:min-w-80">
            <div className="rounded-xl px-3 py-2">
              <span className="block text-lg font-black text-white">{trackedCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Tracked</span>
            </div>
            <div className="rounded-xl px-3 py-2">
              <span className="block text-lg font-black text-white">{completedCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Completed</span>
            </div>
            <div className="rounded-xl px-3 py-2">
              <span className="block text-lg font-black text-white">{completionRate}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Progress</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {systemPlaylists.map(({ name, label, description, icon: Icon, accent, playlist }) => {
            const count = getCount(playlist)
            const content = (
              <>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: `${accent}22`, color: accent }}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-2xl font-black text-white">{count}</span>
                </div>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>{label}</p>
                <h3 className="mt-1 text-lg font-bold text-white">{name}</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 transition-colors group-hover:text-white">
                  Open collection <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </>
            )

            return playlist ? (
              <Link key={name} to={`/playlist/${playlist.id}`} className="group bg-[#1b1b22] p-5 transition-colors hover:bg-[#23232c] sm:p-6">
                {content}
              </Link>
            ) : (
              <div key={name} className="bg-[#1b1b22] p-5 opacity-70 sm:p-6">
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
