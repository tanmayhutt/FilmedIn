import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'react-hot-toast'
import { ArrowDown, ArrowRight, Check, Clapperboard, Download, Film, Library, Sparkles, Tv, Users } from 'lucide-react'
import { googleLoginAction } from '@/services/auth.service'
import { Logo } from '@/components/common/Logo'
import { getSafeRedirect } from '@/utils/navigation'
import { fetchTrendingMovies, fetchTrendingTV, TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'

type CatalogueTitle = TMDBMovie | TMDBTVShow

const fallbackTitles: CatalogueTitle[] = [
  { id: 1368337, title: 'The Odyssey', overview: '', poster_path: '/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg', backdrop_path: null, release_date: '2026-07-15', vote_average: 8, vote_count: 3062, media_type: 'movie' },
  { id: 969681, title: 'Spider-Man: Brand New Day', overview: '', poster_path: '/iPOn6DinuVyLY17YM9mKuPofV08.jpg', backdrop_path: null, release_date: '2026-07-29', vote_average: 7.9, vote_count: 2046, media_type: 'movie' },
  { id: 1084244, title: 'Toy Story 5', overview: '', poster_path: '/sfQtVlIHljToOwYjhe21KPGzZWK.jpg', backdrop_path: null, release_date: '2026-06-17', vote_average: 8.1, vote_count: 1357, media_type: 'movie' },
  { id: 1339713, title: 'Obsession', overview: '', poster_path: '/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg', backdrop_path: null, release_date: '2026-05-13', vote_average: 8.2, vote_count: 4921, media_type: 'movie' },
  { id: 1083381, title: 'Backrooms', overview: '', poster_path: '/rhGx6E3qRNMgj3i5su2oukNHwIQ.jpg', backdrop_path: null, release_date: '2026-05-27', vote_average: 7.1, vote_count: 2893, media_type: 'movie' },
  { id: 687163, title: 'Project Hail Mary', overview: '', poster_path: '/yihdXomYb5kTeSivtFndMy5iDmf.jpg', backdrop_path: null, release_date: '2026-03-15', vote_average: 8.6, vote_count: 7241, media_type: 'movie' },
  { id: 1275779, title: 'Disclosure Day', overview: '', poster_path: '/AnJ8IQJI23hNpYXVNaythu061Ru.jpg', backdrop_path: null, release_date: '2026-06-10', vote_average: 7.5, vote_count: 2940, media_type: 'movie' },
  { id: 1228710, title: 'The Mandalorian and Grogu', overview: '', poster_path: '/7GV5rrUJf0BRUhoh2cyFoeNthlQ.jpg', backdrop_path: null, release_date: '2026-05-20', vote_average: 7.5, vote_count: 1330, media_type: 'movie' },
]

function titleName(item: CatalogueTitle) {
  return 'title' in item ? item.title : item.name
}

function Poster({ item, className = '' }: { item: CatalogueTitle; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-[#1a1d26] shadow-2xl ${className}`}>
      {item.poster_path ? <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} alt={titleName(item)} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-zinc-700"><Film className="h-5 w-5" /></div>}
    </div>
  )
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [catalogue, setCatalogue] = useState<CatalogueTitle[]>(fallbackTitles)
  const location = useLocation()
  const redirect = getSafeRedirect(new URLSearchParams(location.search).get('redirect'))

  useEffect(() => {
    Promise.all([fetchTrendingMovies(), fetchTrendingTV()])
      .then(([movies, shows]) => {
        const items = [...movies.slice(0, 10), ...shows.slice(0, 10)].filter((item) => item.poster_path)
        if (items.length >= 8) setCatalogue(items)
      })
      .catch(() => undefined)
  }, [])

  const posters = useMemo(() => Array.from({ length: 18 }, (_, index) => catalogue[index % catalogue.length]), [catalogue])

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return toast.error('Google did not return a sign-in credential.')
    setLoading(true)
    const res = await googleLoginAction(credentialResponse.credential)
    setLoading(false)
    if (res.error) return toast.error(res.error)
    toast.success('Signed in successfully')
    window.location.href = res.isNewUser ? `/onboarding?redirect=${encodeURIComponent(redirect)}` : redirect || '/'
  }

  return (
    <main className="min-h-screen bg-[#0b0d12] text-white">
      <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_410px]">
        <div className="order-2 min-w-0 lg:order-none">
          <section className="relative min-h-[760px] overflow-hidden border-b border-white/[0.07] sm:min-h-screen">
            <div className="absolute inset-0 grid grid-cols-4 gap-2 p-2 opacity-75 sm:grid-cols-6 sm:gap-3 sm:p-4">
              {posters.map((item, index) => <Poster key={`${item.id}-${index}`} item={item} className={`aspect-[2/3] ${index % 3 === 1 ? '-translate-y-24' : index % 3 === 2 ? '-translate-y-10' : ''}`} />)}
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,12,0.38)_0%,rgba(7,8,12,0.52)_36%,#0b0d12_94%),linear-gradient(90deg,rgba(11,13,18,0.15),rgba(11,13,18,0.38))]" />
            <div className="relative flex min-h-[760px] flex-col px-5 py-6 sm:min-h-screen sm:px-10 sm:py-9 lg:px-14">
              <div className="flex items-center justify-between"><Logo /><span className="rounded-full border border-white/15 bg-black/25 px-4 py-2 text-[11px] font-semibold text-white/70 backdrop-blur-md">Movies and television, together</span></div>
              <div className="mt-auto max-w-4xl pb-10 sm:pb-16">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d2b48c]">Your cinematic identity</p>
                <h1 className="mt-5 text-5xl font-black leading-[0.96] tracking-[-0.05em] sm:text-7xl xl:text-[5.8rem]">Everything you watch.<br /><span className="text-white/55">One place that feels like yours.</span></h1>
                <p className="mt-7 max-w-2xl text-sm leading-7 text-white/70 sm:text-lg sm:leading-8">Track films and series, remember what you finished, build collections, explore the people behind every title, and find your next watch without the clutter.</p>
                <a href="#what-you-can-do" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-zinc-950 transition-transform hover:-translate-y-0.5">See what FilmedIn does <ArrowDown className="h-4 w-4" /></a>
              </div>
            </div>
          </section>

          <section id="what-you-can-do" className="px-5 py-24 sm:px-10 sm:py-32 lg:px-14">
            <div className="mx-auto max-w-6xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d2b48c]">A library, not a database</p>
              <h2 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">Know exactly where every story belongs.</h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">A title moves with you. Save it for later, mark what you are watching, keep a record when you finish, and like the ones that stay with you.</p>
              <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
                { label: 'Watchlist', detail: 'What comes next', icon: Library, poster: catalogue[0] },
                { label: 'Watching', detail: 'In progress now', icon: Tv, poster: catalogue[1] },
                { label: 'Watched', detail: 'Your completed history', icon: Check, poster: catalogue[2] },
                { label: 'Liked', detail: 'The ones worth keeping', icon: Sparkles, poster: catalogue[3] },
              ].map(({ label, detail, icon: Icon, poster }) => <div key={label} className="group relative min-h-[340px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#14171f] p-5"><Poster item={poster} className="absolute inset-0 rounded-none opacity-35 transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#11131a] via-[#11131a]/75 to-transparent" /><div className="relative flex h-full flex-col justify-end"><Icon className="h-5 w-5 text-[#d6b2e8]" /><h3 className="mt-4 text-xl font-black">{label}</h3><p className="mt-1 text-xs text-zinc-400">{detail}</p></div></div>)}</div>
            </div>
          </section>

          <section className="border-y border-white/[0.07] bg-[#11131a] px-5 py-24 sm:px-10 sm:py-32 lg:px-14">
            <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div><span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400"><Film className="h-3.5 w-3.5" />Movies <span className="text-zinc-700">+</span> <Tv className="h-3.5 w-3.5" />TV shows</span><h2 className="mt-6 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Stop splitting your taste between two apps.</h2><p className="mt-6 text-base leading-8 text-zinc-400">Films, limited series, long-running shows, seasons, episodes, ratings, and watch states live in the same calm library.</p></div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">{catalogue.slice(4, 10).map((item, index) => <div key={`${item.id}-${index}`} className={index > 2 ? 'translate-y-8' : ''}><Poster item={item} className="aspect-[2/3]" /><p className="mt-3 truncate text-xs font-semibold text-zinc-300">{titleName(item)}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">{'title' in item ? 'Movie' : 'TV show'}</p></div>)}</div>
            </div>
          </section>

          <section className="px-5 py-24 sm:px-10 sm:py-32 lg:px-14">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d2b48c]">Follow the work</p><h2 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-6xl">A cast name should lead somewhere.</h2></div><p className="text-base leading-8 text-zinc-400">Open anyone in a movie or show. See their biography, every major film and television credit, the roles they played, and jump directly into another title.</p></div>
              <div className="mt-14 overflow-hidden rounded-[2.25rem] border border-white/[0.08] bg-[#151821] p-6 sm:p-9"><div className="grid gap-8 md:grid-cols-[180px_1fr]"><div className="aspect-[3/4] rounded-[1.5rem] bg-[radial-gradient(circle_at_55%_22%,#d8aa83_0%,#8b5949_26%,#2a2024_58%,#13151c_100%)]" /><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Cast and filmography</p><h3 className="mt-3 text-3xl font-black">One performance becomes a path.</h3><div className="mt-7 grid grid-cols-4 gap-3">{catalogue.slice(6, 10).map((item) => <div key={item.id}><Poster item={item} className="aspect-[2/3]" /><p className="mt-2 truncate text-[10px] font-semibold text-zinc-400">{titleName(item)}</p></div>)}</div><div className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-[#d6b2e8]">Explore complete credits <ArrowRight className="h-4 w-4" /></div></div></div></div>
            </div>
          </section>

          <section className="relative min-h-[680px] overflow-hidden border-y border-white/[0.07] bg-[linear-gradient(180deg,#34284f_0%,#a65f6e_42%,#dd9d76_58%,#17202b_59%,#0e1117_100%)] px-5 py-24 sm:px-10 sm:py-32 lg:px-14">
            <div className="absolute left-[12%] top-[18%] h-24 w-24 rounded-full bg-[#ffe0ad]/80 blur-md" /><div className="absolute inset-x-0 bottom-[32%] h-[32%] bg-[#24263b] [clip-path:polygon(0_82%,13%_38%,25%_72%,42%_18%,58%_76%,73%_30%,87%_66%,100%_35%,100%_100%,0_100%)]" /><div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-[#485166]/80 to-[#0b0d12]" />
            <div className="relative mx-auto flex min-h-[430px] max-w-6xl flex-col justify-between"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">Cinematic wallpaper studio</p><h2 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Take the atmosphere with you.</h2><p className="mt-6 max-w-xl text-base leading-8 text-white/75">Choose a title and FilmedIn turns its colour palette into an original landscape or abstract wallpaper. Pick desktop or mobile, preview it, and download the finished image.</p></div><div className="flex flex-wrap items-center gap-3"><span className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold backdrop-blur">Title palette</span><span className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold backdrop-blur">Desktop and mobile</span><span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-zinc-950"><Download className="h-4 w-4" />Download PNG</span></div></div>
          </section>

          <section className="px-5 py-24 sm:px-10 sm:py-32 lg:px-14">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d2b48c]">Taste is better shared</p><h2 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Find the overlap without losing yourself.</h2><p className="mt-6 max-w-xl text-base leading-8 text-zinc-400">Follow people whose taste you trust, open their collections, and create a Taste Blend to see what you both like and what you should watch together.</p></div><div className="rounded-[1.25rem] border border-white/[0.08] bg-[#171817] p-7"><div className="flex items-center justify-between"><div className="flex -space-x-3"><span className="h-12 w-12 rounded-full border-4 border-[#171817] bg-[#d2b48c]" /><span className="h-12 w-12 rounded-full border-4 border-[#171817] bg-zinc-600" /></div><Users className="h-5 w-5 text-zinc-600" /></div><p className="mt-8 text-sm font-bold">Your Taste Blend</p><div className="mt-4 h-3 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-[78%] rounded-full bg-[#d2b48c]" /></div><div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500"><span>Shared taste</span><span>78% match</span></div></div></div>
          </section>

          <section className="border-t border-white/[0.07] px-5 py-24 text-center sm:px-10 sm:py-32 lg:px-14"><Clapperboard className="mx-auto h-8 w-8 text-[#d2b48c]" /><h2 className="mx-auto mt-7 max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">Your watch history deserves a better home.</h2><p className="mx-auto mt-6 max-w-xl text-base leading-8 text-zinc-400">Start with Google and build the movie-and-TV collection that actually reflects you.</p><a href="#sign-in" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-zinc-950">Continue to sign in <ArrowRight className="h-4 w-4" /></a></section>
        </div>

        <aside id="sign-in" className="order-1 min-h-[520px] border-t border-white/[0.08] bg-[#11131a] px-6 py-14 lg:order-none lg:sticky lg:top-0 lg:h-screen lg:border-l lg:border-t-0 lg:px-10">
          <div className="mx-auto flex h-full w-full max-w-sm flex-col justify-center">
            <Logo />
            <h2 className="mt-12 text-3xl font-black tracking-tight">Welcome to FilmedIn</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Sign in with Google to open your personal movie and TV library.</p>
            <div className="mt-8 min-h-12">{loading ? <div className="flex h-11 items-center gap-3 rounded-full bg-white/[0.05] px-5 text-sm text-zinc-400"><span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />Signing you in...</div> : <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Google Sign-In could not start. Check that this domain is allowed in Google Cloud.')} theme="filled_black" size="large" shape="pill" width="330" text="continue_with" />}</div>
            <p className="mt-7 text-[11px] leading-5 text-zinc-600">FilmedIn never receives your Google password. By continuing, you agree to the <Link to="/terms" className="text-zinc-400 hover:text-white">Terms of Service</Link> and acknowledge the <Link to="/privacy" className="text-zinc-400 hover:text-white">Privacy Policy</Link>.</p>
            <div className="mt-auto hidden border-t border-white/[0.07] pt-6 text-[10px] leading-5 text-zinc-700 lg:block">Movie and television metadata is provided by TMDB. FilmedIn is not endorsed or certified by TMDB.</div>
          </div>
        </aside>
      </div>
    </main>
  )
}
