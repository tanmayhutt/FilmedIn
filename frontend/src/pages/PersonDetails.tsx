import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Clapperboard, MapPin, Star } from 'lucide-react'
import { fetchPersonDetails, TMDBPerson, TMDBPersonCredit } from '@/services/tmdb.service'
import { usePageMetadata } from '@/components/common/RouteMetadata'

function creditTitle(credit: TMDBPersonCredit) {
  return credit.media_type === 'movie' ? credit.title : credit.name
}

function creditYear(credit: TMDBPersonCredit) {
  return (credit.release_date || credit.first_air_date || '').slice(0, 4)
}

export default function PersonDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [person, setPerson] = useState<TMDBPerson | null>(null)
  const [loading, setLoading] = useState(true)

  usePageMetadata(person?.name, person ? `Explore ${person.name}'s movie and TV credits on FilmedIn.` : undefined, person?.profile_path ? `https://image.tmdb.org/t/p/h632${person.profile_path}` : undefined)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchPersonDetails(id).then(setPerson).finally(() => setLoading(false))
  }, [id])

  const credits = useMemo(() => {
    const entries = [...(person?.combined_credits?.cast || []), ...(person?.combined_credits?.crew || [])]
      .filter((credit) => (credit.media_type === 'movie' || credit.media_type === 'tv') && credit.poster_path && creditTitle(credit))
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    const seen = new Set<string>()
    return entries.filter((credit) => {
      const key = `${credit.media_type}-${credit.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 36)
  }, [person])

  if (loading) return <main className="mx-auto min-h-[70vh] w-full max-w-7xl animate-pulse px-4 py-12 sm:px-6 lg:px-8"><div className="h-80 rounded-[2rem] bg-[var(--theme-dark)]" /></main>
  if (!person) return <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-20 text-center"><Clapperboard className="mx-auto h-8 w-8 text-zinc-600" /><h1 className="mt-5 text-2xl font-bold">Person not found</h1></main>

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <button type="button" onClick={() => navigate(-1)} className="clay-button-secondary inline-flex items-center gap-2 px-4 py-2 text-xs"><ArrowLeft className="h-4 w-4" /> Back</button>

      <section className="mt-7 grid gap-8 rounded-[1.5rem] border border-white/[0.08] bg-[#171817] p-5 sm:p-8 md:grid-cols-[240px_1fr]">
        <div className="mx-auto aspect-[2/3] w-full max-w-[240px] overflow-hidden rounded-[1.75rem] bg-white/[0.04]">
          {person.profile_path ? <img src={`https://image.tmdb.org/t/p/h632${person.profile_path}`} alt={person.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-zinc-600">No photo</div>}
        </div>
        <div className="min-w-0 py-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d2b48c]">{person.known_for_department || 'Filmography'}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{person.name}</h1>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-zinc-400">
            {person.birthday && <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-2"><CalendarDays className="h-3.5 w-3.5" />{new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            {person.place_of_birth && <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-2"><MapPin className="h-3.5 w-3.5" />{person.place_of_birth}</span>}
          </div>
          {person.biography ? <p className="mt-7 max-w-3xl whitespace-pre-line text-sm leading-7 text-zinc-300 sm:text-base">{person.biography}</p> : <p className="mt-7 text-zinc-500">Biography information is not available.</p>}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="filmography-heading">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Across movies and television</p><h2 id="filmography-heading" className="mt-2 text-3xl font-black text-white">Known credits</h2></div>
          <span className="text-xs text-zinc-500">{credits.length} titles</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {credits.map((credit) => (
            <Link key={`${credit.media_type}-${credit.id}`} to={`/${credit.media_type}/${credit.id}`} className="group min-w-0">
              <div className="aspect-[2/3] overflow-hidden rounded-[1.4rem] bg-[var(--theme-dark)] ring-1 ring-white/[0.06] transition-transform duration-300 group-hover:-translate-y-1">
                <img src={`https://image.tmdb.org/t/p/w342${credit.poster_path}`} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <h3 className="mt-3 truncate text-sm font-bold text-zinc-100">{creditTitle(credit)}</h3>
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-zinc-500"><span>{credit.media_type === 'movie' ? 'Movie' : 'TV'}{creditYear(credit) ? ` · ${creditYear(credit)}` : ''}</span>{credit.vote_average > 0 && <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" />{credit.vote_average.toFixed(1)}</span>}</div>
              {(credit.character || credit.job) && <p className="mt-1 truncate text-[11px] text-zinc-600">{credit.character || credit.job}</p>}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
