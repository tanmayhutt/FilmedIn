import { useEffect, useState } from 'react'
import { fetchApi } from '@/services/api.client'
import { Link, useLocation } from 'react-router-dom'
import { UserAvatar } from './UserAvatar'
import { clearSessionHint, hasSessionHint } from '@/utils/auth'

export function NavbarProfile() {
  const [profile, setProfile] = useState<any>(null)
  const location = useLocation()

  useEffect(() => {
    const loadProfile = () => {
      if (hasSessionHint()) {
      fetchApi('/users/me')
        .then(data => setProfile(data))
        .catch(() => {
          clearSessionHint()
          setProfile(null)
        })
      } else {
        setProfile(null)
      }
    }
    loadProfile()
    window.addEventListener('auth-changed', loadProfile)
    return () => window.removeEventListener('auth-changed', loadProfile)
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
    <div className="flex items-center gap-2">
      <Link to="/profile" className="hidden rounded-full px-3 py-2 text-xs font-bold text-zinc-400 transition-colors hover:bg-white/5 hover:text-white sm:block">
        My Library
      </Link>
      <Link
        to={`/u/${profile.username}`}
        aria-label={`Open ${profile.username}'s profile`}
        className="group transition-opacity hover:opacity-90 focus:outline-none"
      >
        <UserAvatar
          avatarUrl={profile?.avatarUrl}
          username={profile?.username}
          className="w-9 h-9 border border-white/20/80 group-hover:border-white transition-colors"
        />
      </Link>
    </div>
  )
}
