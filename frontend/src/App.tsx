import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'

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
import Studio from '@/pages/Studio'
import StudiosIndex from '@/pages/StudiosIndex'
import Explore from '@/pages/Explore'

export default function App() {
  return (
    <>
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/tv/:id" element={<TVDetails />} />
          <Route path="/studios" element={<StudiosIndex />} />
          <Route path="/studio/:id" element={<Studio />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile/playlist/:id" element={<PlaylistDetails />} />
        </Routes>
      </div>
    </>
  )
}

