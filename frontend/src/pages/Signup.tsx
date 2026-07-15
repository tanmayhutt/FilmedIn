import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signupClientAction } from '@/services/auth.service'
import { Eye, EyeOff } from 'lucide-react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }
    
    try {
      const res = await signupClientAction({ email, password, username })
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto pt-20">
      <div className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <h1 className="text-3xl font-semibold text-zinc-100 mb-6 text-center">Create Account</h1>
        
        {success ? (
          <div className="p-6 bg-zinc-900 border border-zinc-800 text-zinc-200 text-center rounded-lg space-y-4">
            <h3 className="font-semibold text-xl text-zinc-100">Account Created!</h3>
            <p className="text-zinc-400">Welcome to FilmedIn.</p>
            <p className="text-sm opacity-80">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-md font-medium text-zinc-300" htmlFor="username">
              Username
            </label>
            <Input
              className="mb-4 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="moviefan99"
              required
            />
            <label className="text-md font-medium text-zinc-300" htmlFor="email">
              Email
            </label>
            <Input
              className="mb-4 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <label className="text-md font-medium text-zinc-300" htmlFor="password">
              Password
            </label>
            <div className="relative mb-6">
              <Input
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700 pr-10"
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <label className="text-md font-medium text-zinc-300" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative mb-6">
              <Input
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700 pr-10"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button type="submit" disabled={loading} className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300 w-full mb-2 h-12">
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>

            {error && (
              <p className="mt-4 p-4 bg-red-900/50 border border-red-800/50 text-red-200 text-center rounded-lg">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-4 mt-6 text-center text-sm">
              <div className="text-zinc-500">
                Already have an account?{' '}
                <Link to="/login" className="text-white hover:underline transition-colors font-medium">
                  Log in
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
