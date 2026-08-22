import { useEffect, useState } from 'react'
import { fetchApi } from '@/services/api.client'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { UserAvatar } from './UserAvatar'
import { clearSessionHint, hasSessionHint } from '@/utils/auth'
import { signout } from '@/services/auth.service'

export function NavbarProfile({ showLibraryLink = true, showLogout = false }: { showLibraryLink?: boolean; showLogout?: boolean }) {
  const [profile, setProfile] = useState<any>(null)
  const [signingOut, setSigningOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

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

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signout()
    } catch {
      // The local session is still cleared when the server is unavailable.
    } finally {
      setProfile(null)
      navigate('/login', { replace: true })
      setSigningOut(false)
    }
  }

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
    <div className="flex min-w-0 items-center gap-2">
      {showLibraryLink && (
        <Link to="/profile" className="hidden rounded-full px-3 py-2 text-xs font-bold text-zinc-400 transition-colors hover:bg-white/5 hover:text-white sm:block">
          My Library
        </Link>
      )}
      <Link
        to={`/u/${profile.username}`}
        aria-label={`Open ${profile.username}'s profile`}
        className={`group flex min-w-0 items-center gap-3 rounded-xl p-1 transition-colors hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2b48c] ${showLogout ? 'flex-1' : ''}`}
      >
        <UserAvatar
          avatarUrl={profile?.avatarUrl}
          username={profile?.username}
          className="w-9 h-9 border border-white/20/80 group-hover:border-white transition-colors"
        />
        {showLogout && (
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-zinc-300">@{profile.username}</span>
        )}
      </Link>
      {showLogout && (
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          aria-label={signingOut ? 'Logging out' : 'Log out'}
          title="Log out"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2b48c] disabled:cursor-wait disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
