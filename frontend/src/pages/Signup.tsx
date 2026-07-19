import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signupClientAction, verifyLoginOtpAction } from '@/services/auth.service'
import { Eye, EyeOff, KeyRound } from 'lucide-react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // OTP State
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [otp, setOtp] = useState('')
  const [signupEmail, setSignupEmail] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  
  const searchParams = new URLSearchParams(location.search)
  const redirectUrl = searchParams.get('redirect')

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/', { replace: true })
    }
  }, [navigate])

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
      } else if (res.requireOtp) {
        setSignupEmail(res.email)
        setStep('otp')
      } else {
        // Fallback
        navigate('/login')
      }
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await verifyLoginOtpAction(signupEmail, otp)
      if (res.error) {
        setError(res.error)
      } else {
        // Successfully verified OTP during signup, logged in automatically
        if (redirectUrl && redirectUrl !== '/login' && redirectUrl !== '/signup') {
          navigate(redirectUrl)
        } else {
          navigate('/')
        }
      }
    } catch (err: any) {
      setError('Something went wrong verifying your code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto pt-20">
      <div className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <h1 className="text-3xl font-semibold text-zinc-100 mb-6 text-center">
          {step === 'credentials' ? 'Create Account' : 'Verify Email'}
        </h1>
        
        {step === 'credentials' ? (
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
                <Link to={`/login${location.search}`} className="text-white hover:underline transition-colors font-medium">
                  Log in
                </Link>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <p className="text-zinc-400 text-center mb-4">
              We sent a 6-digit code to <strong>{signupEmail}</strong>. Please enter it below to securely log in.
            </p>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <Input
                className="pl-10 h-12 text-center text-xl tracking-widest bg-zinc-900 border-zinc-800 text-zinc-100"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
                autoFocus
              />
            </div>
            
            <Button type="submit" disabled={loading || otp.length !== 6} className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300 w-full h-12 mt-4">
              {loading ? 'Verifying...' : 'Verify & Login'}
            </Button>
            
            {error && (
              <p className="mt-4 p-3 bg-red-900/50 border border-red-800/50 text-red-200 text-center rounded-lg text-sm">
                {error}
              </p>
            )}
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setStep('credentials')}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Back to Sign Up
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
