import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { Toaster } from 'react-hot-toast'

// Pages
import Home from '@/pages/Home'
// We will import these once we create them
import Search from '@/pages/Search'
import MovieDetails from '@/pages/MovieDetails'
import TVDetails from '@/pages/TVDetails'
import Profile from '@/pages/Profile'
import PlaylistDetails from '@/pages/PlaylistDetails'
import Login from '@/pages/Login'
import Onboarding from '@/pages/Onboarding'
import Studio from '@/pages/Studio'
import StudiosIndex from '@/pages/StudiosIndex'
import Explore from '@/pages/Explore'
import About from '@/pages/About'
import TasteBlend from '@/pages/TasteBlend'

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#18181b',
          color: '#fff',
          border: '1px solid #27272a'
        }
      }} />
      <ScrollToTop />
      <Navbar />
      <div className="flex-1 flex flex-col w-full pb-12 md:pb-24">
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
          <Route path="/blend/:username" element={<TasteBlend />} />
          <Route path="/profile/playlist/:id" element={<PlaylistDetails />} />
          <Route path="/playlist/:id" element={<PlaylistDetails />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

