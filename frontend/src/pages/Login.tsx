import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'react-hot-toast'
import { Bookmark, Check, Clapperboard, Download, Film, Library, MousePointer2, Play, Sparkles, Tv, Users } from 'lucide-react'
import { googleLoginAction } from '@/services/auth.service'
import { Logo } from '@/components/common/Logo'
import { getSafeRedirect } from '@/utils/navigation'

const demos = [
  { label: 'Your library', caption: 'Move every movie and show through one clear viewing journey.' },
  { label: 'Cast discovery', caption: 'Open a cast member and follow their work across film and television.' },
  { label: 'Wallpaper studio', caption: 'Turn the colours of a title into an original cinematic wallpaper.' },
]

function LibraryDemo() {
  const cards = [
    { title: 'Dune: Part Two', type: 'Movie', state: 'Watched', tone: 'from-amber-700 to-orange-950' },
    { title: 'Severance', type: 'TV Show', state: 'Watching', tone: 'from-sky-700 to-slate-950' },
    { title: 'Shōgun', type: 'TV Show', state: 'Watchlist', tone: 'from-red-800 to-zinc-950' },
  ]
  return <div className="grid h-full content-center gap-5 p-5 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#caa4df]">My Library</p><h3 className="mt-1 text-xl font-black text-white">Everything you watch</h3></div><span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] text-zinc-400">12 completed</span></div><div className="grid grid-cols-3 gap-3">{cards.map((card, index) => <div key={card.title} className={`relative aspect-[2/3] overflow-hidden rounded-2xl bg-gradient-to-br ${card.tone} p-3 shadow-xl`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.25),transparent_30%)]" /><div className="relative flex h-full flex-col justify-end"><p className="text-xs font-black leading-tight text-white sm:text-sm">{card.title}</p><p className="mt-1 text-[9px] text-white/60">{card.type}</p><span className={`mt-3 inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[8px] font-bold ${index === 0 ? 'bg-emerald-300 text-emerald-950' : index === 1 ? 'bg-amber-300 text-amber-950' : 'bg-white/15 text-white'}`}>{index === 0 ? <Check className="h-2.5 w-2.5" /> : index === 1 ? <Play className="h-2.5 w-2.5" /> : <Bookmark className="h-2.5 w-2.5" />}{card.state}</span></div></div>)}</div></div>
}

function CastDemo() {
  return <div className="grid h-full content-center gap-5 p-5 sm:p-8"><div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.035] p-5"><div className="flex gap-4"><div className="h-28 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-amber-300 via-orange-700 to-zinc-950" /><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Cast profile</p><h3 className="mt-2 text-xl font-black text-white">Explore every credit</h3><p className="mt-2 text-xs leading-5 text-zinc-400">Move from a title to its cast, then discover the movies and shows behind each performance.</p></div></div></div><div className="grid grid-cols-4 gap-2">{['Oppenheimer', 'Peaky Blinders', 'A Quiet Place', 'Dunkirk'].map((title, index) => <div key={title}><div className={`aspect-[2/3] rounded-xl bg-gradient-to-br ${['from-orange-700 to-zinc-950','from-slate-600 to-zinc-950','from-red-900 to-zinc-950','from-blue-800 to-zinc-950'][index]}`} /><p className="mt-2 truncate text-[9px] font-semibold text-zinc-300">{title}</p></div>)}</div></div>
}

function WallpaperDemo() {
  return <div className="grid h-full content-center gap-5 p-5 sm:p-8"><div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#3a315d] via-[#bd6f72] to-[#171a22] shadow-2xl"><div className="absolute left-[12%] top-[16%] h-12 w-12 rounded-full bg-[#ffd4a3]/80 blur-sm" /><div className="absolute inset-x-0 bottom-[24%] h-[38%] bg-[#24233b] [clip-path:polygon(0_80%,18%_28%,32%_68%,48%_12%,64%_70%,82%_32%,100%_78%,100%_100%,0_100%)]" /><div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-[#765268]/80 to-[#11131a]" /><div className="absolute inset-x-0 bottom-[18%] h-px bg-[#ffd4a3]/30" /><span className="absolute left-4 top-4 rounded-full bg-black/30 px-3 py-1 text-[9px] font-bold tracking-wider text-white backdrop-blur">CINEMATIC LANDSCAPE</span></div><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-white">A title becomes your scenery</p><p className="mt-1 text-[10px] text-zinc-500">Desktop and mobile formats</p></div><button type="button" tabIndex={-1} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-bold text-zinc-950"><Download className="h-3.5 w-3.5" />Download</button></div></div>
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [activeDemo, setActiveDemo] = useState(0)
  const location = useLocation()
  const redirect = getSafeRedirect(new URLSearchParams(location.search).get('redirect'))

  useEffect(() => {
    const timer = window.setInterval(() => setActiveDemo((current) => (current + 1) % demos.length), 5200)
    return () => window.clearInterval(timer)
  }, [])

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
    <main className="min-h-screen bg-[#0d0f15] text-white">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_430px]">
        <section className="relative min-w-0 overflow-hidden px-5 pb-12 pt-6 sm:px-9 lg:px-12 lg:py-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_15%,rgba(154,107,193,0.24),transparent_30%),radial-gradient(circle_at_78%_68%,rgba(91,127,162,0.14),transparent_34%)]" />
          <div className="relative mx-auto max-w-5xl">
            <div className="flex items-center justify-between"><Logo /><p className="hidden text-xs font-semibold text-zinc-500 sm:block">Movies and TV, finally together</p></div>

            <div className="mt-12 max-w-3xl sm:mt-16"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#caa4df]">Your cinematic identity</p><h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl xl:text-7xl">Remember everything.<br /><span className="text-zinc-500">Discover what comes next.</span></h1><p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">Build one calm personal library for movies and shows, track every viewing state, explore complete cast filmographies, compare taste with friends, and create title-inspired wallpapers.</p></div>

            <div className="mt-10 grid gap-4 xl:grid-cols-[minmax(0,1fr)_210px]">
              <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#151821]/90 shadow-[0_40px_100px_rgba(0,0,0,0.35)]">
                <div key={activeDemo} className="h-full animate-in fade-in slide-in-from-bottom-3 duration-700">{activeDemo === 0 ? <LibraryDemo /> : activeDemo === 1 ? <CastDemo /> : <WallpaperDemo />}</div>
                <div className={`pointer-events-none absolute z-20 hidden transition-all duration-1000 sm:block ${activeDemo === 0 ? 'left-[68%] top-[70%]' : activeDemo === 1 ? 'left-[40%] top-[68%]' : 'left-[77%] top-[77%]'}`}><span className="absolute -inset-3 animate-ping rounded-full border border-[#caa4df]/40" /><MousePointer2 className="h-6 w-6 fill-white text-zinc-950 drop-shadow-lg" /></div>
              </div>
              <div className="grid grid-cols-3 gap-2 xl:grid-cols-1">{demos.map((demo, index) => <button key={demo.label} type="button" onClick={() => setActiveDemo(index)} aria-pressed={activeDemo === index} className={`rounded-[1.4rem] border p-3 text-left transition-all sm:p-4 ${activeDemo === index ? 'border-[#9a6bc1]/50 bg-[#9a6bc1]/15 text-white' : 'border-white/[0.07] bg-white/[0.025] text-zinc-500 hover:bg-white/[0.05]'}`}><span className="text-[10px] font-bold sm:text-xs">{demo.label}</span><p className="mt-2 hidden text-[10px] leading-4 text-zinc-500 xl:block">{demo.caption}</p></button>)}</div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">{[
              { icon: Library, text: 'Viewing states' }, { icon: Users, text: 'Taste Blend' }, { icon: Clapperboard, text: 'Cast filmography' }, { icon: Sparkles, text: 'Wallpaper studio' },
            ].map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-xs font-semibold text-zinc-400"><Icon className="h-4 w-4 text-[#b987d2]" />{text}</div>)}</div>
          </div>
        </section>

        <aside className="relative flex items-center border-t border-white/[0.08] bg-[#12141b] px-6 py-12 lg:sticky lg:top-0 lg:h-screen lg:border-l lg:border-t-0 lg:px-10">
          <div className="mx-auto w-full max-w-sm"><div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9a6bc1]/15 text-[#caa4df]"><Film className="h-5 w-5" /></div><h2 className="mt-7 text-3xl font-black tracking-tight">Start your library</h2><p className="mt-3 text-sm leading-6 text-zinc-400">One Google sign-in. No password to remember. Your library stays attached to your account across devices.</p>
            <div className="mt-8 min-h-12">{loading ? <div className="flex h-11 items-center gap-3 rounded-full bg-white/[0.05] px-5 text-sm text-zinc-400"><span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />Signing you in...</div> : <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Google Sign-In could not start. Check that this domain is allowed in Google Cloud.')} theme="filled_black" size="large" shape="pill" width="340" text="continue_with" />}</div>
            <div className="mt-8 space-y-3">{['Track movies and TV together', 'Create watchlists and personal collections', 'Generate and download cinematic wallpapers'].map((item) => <div key={item} className="flex items-center gap-3 text-xs text-zinc-400"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><Check className="h-3 w-3" /></span>{item}</div>)}</div>
            <p className="mt-9 text-[11px] leading-5 text-zinc-600">By continuing, you agree to the <Link to="/terms" className="text-zinc-400 hover:text-white">Terms of Service</Link> and acknowledge the <Link to="/privacy" className="text-zinc-400 hover:text-white">Privacy Policy</Link>. Google handles authentication; FilmedIn never receives your Google password.</p>
            <div className="mt-10 flex items-center gap-4 border-t border-white/[0.07] pt-6 text-[11px] text-zinc-600"><Tv className="h-4 w-4" /><span>Powered by TMDB metadata. Not endorsed by TMDB.</span></div>
          </div>
        </aside>
      </div>
    </main>
  )
}
