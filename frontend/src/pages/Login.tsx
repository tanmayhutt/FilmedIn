import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginWithPassword, verifyLoginOtpAction } from '@/services/auth.service'
import { Eye, EyeOff, KeyRound } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // OTP State
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [otp, setOtp] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  
  const navigate = useNavigate()

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await loginWithPassword(email, password)
      if (res.error) {
        if (res.error === 'Invalid Credentials') {
          setError("No account found with these details. Please check your spelling or sign up below.")
        } else {
          setError(res.error)
        }
      } else if (res.requireOtp) {
        setLoginEmail(res.email)
        setStep('otp')
      } else {
        // Fallback if no OTP required
        navigate('/')
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await verifyLoginOtpAction(loginEmail, otp)
      if (res.error) {
        setError(res.error)
      } else {
        navigate('/')
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
          {step === 'credentials' ? 'Sign in' : 'Enter Login Code'}
        </h1>
        
        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-2">
            <label className="text-md font-medium text-zinc-300" htmlFor="email">
              Email or Username
            </label>
            <Input
              className="mb-4 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
              type="text"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com or moviefan99"
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

            <Button type="submit" disabled={loading} className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300 w-full mb-2 h-12">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            {error && (
              <p className="mt-4 p-4 bg-red-900/50 border border-red-800/50 text-red-200 text-center rounded-lg text-sm">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-4 mt-6 text-center text-sm">
              <Link to="/forgot-password" className="text-zinc-400 hover:text-white transition-colors">
                Forgot Credentials?
              </Link>
              <div className="text-zinc-500">
                Don't have an account?{' '}
                <Link to="/signup" className="text-white hover:underline transition-colors font-medium">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <p className="text-zinc-400 text-center mb-4">
              We sent a 6-digit code to <strong>{loginEmail}</strong>. Please enter it below to securely log in.
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
            
            <button 
              type="button"
              onClick={() => setStep('credentials')}
              className="mt-6 text-sm text-zinc-500 hover:text-zinc-300"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
