import { Routes, Route, Link } from 'react-router-dom'
import { NavbarProfile } from '@/components/common/NavbarProfile'

// Pages
import Home from '@/pages/Home'
// We will import these once we create them
import Search from '@/pages/Search'
import MovieDetails from '@/pages/MovieDetails'
import TVDetails from '@/pages/TVDetails'
import Profile from '@/pages/Profile'
import PlaylistDetails from '@/pages/PlaylistDetails'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import ForgotPassword from '@/pages/ForgotPassword'

export default function App() {
  return (
    <>
      <nav className="w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl tracking-tighter">FilmedIn</Link>
          <NavbarProfile />
        </div>
      </nav>
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-username" element={<ForgotPassword />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/tv/:id" element={<TVDetails />} />
          <Route path="/profile/playlist/:id" element={<PlaylistDetails />} />
        </Routes>
      </div>
    </>
  )
}
