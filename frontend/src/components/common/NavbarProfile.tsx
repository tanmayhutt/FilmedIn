import { useEffect, useState } from 'react'
import { fetchApi } from '@/services/api.client'
import { Link, useLocation } from 'react-router-dom'

export function NavbarProfile() {
  const [profile, setProfile] = useState<any>(null)
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchApi('/users/me')
        .then(data => setProfile(data))
        .catch(() => {
          localStorage.removeItem('token')
          setProfile(null)
        })
    } else {
      setProfile(null)
    }
  }, [location])

  if (!profile) {
    return (
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
          Sign In
        </Link>
        <Link to="/signup" className="text-sm font-medium bg-zinc-100 text-zinc-900 px-4 py-2 rounded-full hover:bg-zinc-300 transition-colors hidden sm:block">
          Get Started
        </Link>
      </div>
    )
  }

  return (
    <Link to="/profile" className="flex items-center gap-3 group transition-transform hover:scale-105">
      <span className="text-sm font-medium text-zinc-300 group-hover:text-white hidden sm:block">
        {profile?.username || 'Profile'}
      </span>
      <div className="w-10 h-10 rounded-full border-2 border-zinc-800 group-hover:border-zinc-600 overflow-hidden bg-zinc-900 flex items-center justify-center shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover bg-zinc-100" />
        ) : (
          <span className="text-zinc-500 font-medium">
            {profile?.username?.charAt(0).toUpperCase() || '?'}
          </span>
        )}
      </div>
    </Link>
  )
}
