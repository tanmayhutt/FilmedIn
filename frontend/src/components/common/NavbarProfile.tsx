import { useEffect, useState } from 'react'
import { fetchApi } from '@/services/api.client'
import { Link, useLocation } from 'react-router-dom'
import { UserAvatar } from './UserAvatar'

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
      <div className="flex items-center gap-3">
        <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`} className="text-xs font-semibold bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full transition-all">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <Link 
      to={`/u/${profile.username}`}
      className="flex items-center gap-3 group focus:outline-none hover:opacity-90 transition-opacity"
    >
      <span className="text-sm font-medium text-zinc-400 group-hover:text-white hidden sm:block transition-colors">
        {profile?.username || 'Profile'}
      </span>
      <UserAvatar 
        avatarUrl={profile?.avatarUrl} 
        username={profile?.username} 
        className="w-9 h-9 border border-white/20/80 group-hover:border-white transition-colors"
      />
    </Link>
  )
}
