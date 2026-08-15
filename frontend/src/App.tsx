import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { RouteMetadata } from '@/components/common/RouteMetadata'
import { Spinner } from '@/components/ui/spinner'
import { Toaster } from 'react-hot-toast'

const Home = lazy(() => import('@/pages/Home'))
const Search = lazy(() => import('@/pages/Search'))
const MovieDetails = lazy(() => import('@/pages/MovieDetails'))
const TVDetails = lazy(() => import('@/pages/TVDetails'))
const Profile = lazy(() => import('@/pages/Profile'))
const PlaylistDetails = lazy(() => import('@/pages/PlaylistDetails'))
const Login = lazy(() => import('@/pages/Login'))
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const Studio = lazy(() => import('@/pages/Studio'))
const StudiosIndex = lazy(() => import('@/pages/StudiosIndex'))
const Explore = lazy(() => import('@/pages/Explore'))
const About = lazy(() => import('@/pages/About'))
const TasteBlend = lazy(() => import('@/pages/TasteBlend'))
const Legal = lazy(() => import('@/pages/Legal'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function PageFallback() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center" role="status" aria-live="polite">
      <Spinner className="size-7 text-zinc-300" />
      <span className="sr-only">Loading page</span>
    </div>
  )
}

export default function App() {
  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-950 shadow-xl transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Toaster position="bottom-right" toastOptions={{
        icon: null,
        style: {
          background: '#18181b',
          color: '#fff',
          border: '1px solid #27272a'
        },
        success: { icon: null },
        error: { icon: null }
      }} />
      <ScrollToTop />
      <RouteMetadata />
      <Navbar />
      <div id="main-content" tabIndex={-1} className="flex-1 flex flex-col w-full pb-12 md:pb-24 outline-none">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/u/:username" element={<Profile />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<TVDetails />} />
            <Route path="/studios" element={<StudiosIndex />} />
            <Route path="/studio/:id" element={<Studio />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Legal />} />
            <Route path="/terms" element={<Legal />} />
            <Route path="/blend/:username" element={<TasteBlend />} />
            <Route path="/profile/playlist/:id" element={<PlaylistDetails />} />
            <Route path="/playlist/:id" element={<PlaylistDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
  )
}
