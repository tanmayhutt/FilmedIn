import { useEffect, useState, useRef } from 'react'
import { fetchApi } from '@/services/api.client'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signout } from '@/services/auth.service'
import { LogOut, User } from 'lucide-react'

export function NavbarProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signout()
    setIsOpen(false)
    navigate('/')
  }

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
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 group transition-transform hover:scale-105 focus:outline-none"
      >
        <span className="text-sm font-medium text-zinc-300 group-hover:text-white hidden sm:block">
          {profile?.username || 'Profile'}
        </span>
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 group-hover:border-zinc-600 overflow-hidden bg-zinc-900 flex items-center justify-center shrink-0">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover bg-zinc-100" />
          ) : (
            <span className="text-zinc-500 font-medium">
              {profile?.username?.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <Link 
            to={`/u/${profile.username}`} 
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <User className="w-4 h-4 mr-3" />
            My Profile
          </Link>
          <div className="h-px bg-zinc-800 my-1" />
          <button 
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
