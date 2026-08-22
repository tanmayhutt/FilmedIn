import type { LucideIcon } from 'lucide-react'

export function PlaylistCover({ posters = [], fallback: Fallback, className = 'h-16 w-16' }: { posters?: string[]; fallback: LucideIcon; className?: string }) {
  const visiblePosters = posters.filter(Boolean).slice(0, 4)
  const layout = visiblePosters.length === 2 ? 'grid-cols-2' : visiblePosters.length > 2 ? 'grid-cols-2 grid-rows-2' : ''

  return (
    <span className={`relative grid shrink-0 overflow-hidden rounded-xl border border-white/[0.09] bg-[#20211f] shadow-md ${layout} ${className}`} aria-hidden="true">
      {visiblePosters.length ? visiblePosters.map((poster) => (
        <img key={poster} src={poster} alt="" className="h-full min-h-0 w-full min-w-0 object-cover" />
      )) : (
        <span className="flex h-full w-full items-center justify-center text-zinc-600"><Fallback className="h-5 w-5" /></span>
      )}
    </span>
  )
}
