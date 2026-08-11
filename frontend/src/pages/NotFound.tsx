import { Clapperboard, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <section className="clay-card max-w-2xl w-full p-8 sm:p-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#9062aa]/20 text-[#b98bd2]">
          <Clapperboard aria-hidden="true" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">Error 404</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black text-white">This scene is not in the cut</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-zinc-300">
          The page may have moved, the link may be incomplete, or the title is no longer available.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/" className="clay-button-purple px-6 py-3 text-sm font-bold">Return home</Link>
          <Link to="/explore" className="clay-button-secondary px-6 py-3 text-sm font-bold inline-flex items-center justify-center gap-2">
            <Compass size={16} aria-hidden="true" /> Explore titles
          </Link>
        </div>
      </section>
    </main>
  )
}
