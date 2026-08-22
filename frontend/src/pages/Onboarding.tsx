import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { updateProfile } from '@/services/user.service'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { User, UserRoundCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSafeRedirect } from '@/utils/navigation'

export default function Onboarding() {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const location = useLocation()
  const redirect = getSafeRedirect(new URLSearchParams(location.search).get('redirect'))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      return toast.error('Username must be 3–30 characters using letters, numbers, or underscores')
    }
    
    setLoading(true)
    const res = await updateProfile({ username })
    setLoading(false)
    
    if (res.success) {
      toast.success('Welcome to FilmedIn!')
      window.location.href = redirect || '/' // Force a full reload to reset all app states with the new token
    } else {
      toast.error(res.error || 'Username is already taken or invalid')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 clay-modal p-10 sm:p-12 relative z-10 text-center animate-in zoom-in-95">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 clay-badge-blue flex items-center justify-center mb-6 transform -rotate-6">
            <UserRoundCheck className="w-10 h-10 text-white" aria-hidden="true" />
          </div>
          
          <h1 className="text-3xl font-black text-white mb-3">Claim Your Identity</h1>
          <p className="text-zinc-300 mb-8 text-sm px-2 leading-relaxed font-medium">
            You're almost there! Pick a unique username to connect with friends and share your favorite movies.
          </p>

          <form onSubmit={handleSave} className="w-full flex flex-col gap-6">
            <div className="text-left">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-500" /> Choose a Username
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold select-none">@</span>
                <Input 
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="pl-9 h-14 clay-input text-white text-lg rounded-2xl border-none"
                  placeholder="movielover99"
                  autoFocus
                  minLength={3}
                  maxLength={30}
                  autoComplete="username"
                  aria-describedby="username-help"
                />
              </div>
              <p id="username-help" className="text-xs text-zinc-400 mt-2 ml-1">3–30 characters. Letters, numbers, and underscores only.</p>
            </div>

            <button 
              type="submit" 
              disabled={loading || username.length < 3} 
              className="w-full h-14 clay-button-primary text-lg font-bold disabled:opacity-50 mt-2 flex items-center justify-center"
            >
              {loading ? <Spinner className="w-6 h-6 border-white" /> : 'Get Started'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
