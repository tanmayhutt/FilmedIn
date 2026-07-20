import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { updateProfile } from '@/services/user.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { User, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Onboarding() {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (username.length < 3) {
      return toast.error('Username must be at least 3 characters')
    }
    
    setLoading(true)
    const res = await updateProfile({ username })
    setLoading(false)
    
    if (res.success && res.token) {
      localStorage.setItem('token', res.token)
      toast.success('Welcome to FilmedIn!')
      window.location.href = redirect || '/' // Force a full reload to reset all app states with the new token
    } else {
      toast.error(res.error || 'Username is already taken or invalid')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-md w-full space-y-8 bg-zinc-900/40 p-10 rounded-3xl border border-zinc-800/60 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800 transform -rotate-6 transition-all duration-300">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-3">Claim Your Identity</h2>
          <p className="text-zinc-400 mb-8 text-sm px-4">
            You're almost there! Pick a unique username to connect with friends and share your favorite movies.
          </p>

          <form onSubmit={handleSave} className="w-full flex flex-col gap-6">
            <div className="text-left">
              <label className="text-sm text-zinc-400 font-medium mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" /> Choose a Username
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium select-none group-focus-within:text-white transition-colors">@</span>
                <Input 
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="pl-10 h-14 bg-zinc-900 border-zinc-800 text-white focus:border-zinc-500 text-lg rounded-xl transition-all shadow-inner"
                  placeholder="movielover99"
                  autoFocus
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2 ml-1">Letters, numbers, and underscores only.</p>
            </div>

            <Button 
              type="submit" 
              disabled={loading || username.length < 3} 
              className="w-full h-14 bg-white text-zinc-950 hover:bg-zinc-200 text-lg font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50 disabled:hover:scale-100 mt-2"
            >
              {loading ? <Spinner className="w-6 h-6 border-zinc-950" /> : 'Get Started'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
