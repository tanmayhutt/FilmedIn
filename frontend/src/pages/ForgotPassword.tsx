import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginWithOtpClientAction, verifyOtpClientAction, updatePasswordClientAction } from '@/services/auth.service'
import { Eye, EyeOff } from 'lucide-react'

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [result, setResult] = useState<{ type: 'error' | 'success', message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await loginWithOtpClientAction(email)
      if (res.error) {
        if (res.error === 'No user with this email') {
          setResult({ type: 'error', message: "Account not found." })
        } else {
          setResult({ type: 'error', message: res.error })
        }
      } else {
        setUsername(res.username)
        setResult({ type: 'success', message: 'A 6-digit code has been sent to your email.' })
        setStep('otp')
      }
    } catch (err) {
      setResult({ type: 'error', message: 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await loginWithOtpClientAction(email)
      if (res.error) {
        setResult({ type: 'error', message: res.error })
      } else {
        setResult({ type: 'success', message: 'A new 6-digit code has been sent!' })
      }
    } catch (err) {
      setResult({ type: 'error', message: 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await verifyOtpClientAction(email, otp)
      if (res.error) {
        setResult({ type: 'error', message: res.error })
      } else {
        setResult({ type: 'success', message: 'Code verified! Please enter your new password.' })
        setStep('password')
      }
    } catch (err) {
      setResult({ type: 'error', message: 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await updatePasswordClientAction(newPassword)
      if (res.error) {
        setResult({ type: 'error', message: res.error })
      } else {
        navigate('/profile')
      }
    } catch (err) {
      setResult({ type: 'error', message: 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto pt-20">
      <div className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <h1 className="text-3xl font-semibold text-zinc-100 mb-6 text-center">Reset Credentials</h1>
        
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
            <label className="text-md font-medium text-zinc-300" htmlFor="email">
              Account Email Address
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
            <Button type="submit" disabled={loading} className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300 w-full mb-2 h-12">
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </Button>
          </form>
        ) : step === 'otp' ? (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-2">
            {username && (
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 mb-2">
                <p className="text-sm text-zinc-400 text-center">
                  Resetting password for: <span className="font-semibold text-zinc-200">@{username}</span>
                </p>
              </div>
            )}
            <label className="text-md font-medium text-zinc-300" htmlFor="otp">
              6-Digit Code
            </label>
            <Input
              className="mb-4 bg-zinc-900 border-zinc-800 text-zinc-100 text-center tracking-widest text-2xl placeholder:text-zinc-600 focus-visible:ring-zinc-700 h-16"
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              required
            />
            <Button type="submit" disabled={loading} className="bg-green-600 text-white hover:bg-green-500 w-full mb-2 h-12">
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
            
            <button 
              type="button" 
              onClick={handleResendOtp}
              disabled={loading}
              className="text-sm text-zinc-400 hover:text-white transition-colors mt-2"
            >
              Didn't receive a code? Resend
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-2">
            <label className="text-md font-medium text-zinc-300" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative mb-4">
              <Input
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700 pr-10"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
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
            <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-500 w-full mb-2 h-12">
              {loading ? 'Updating...' : 'Update Password & Login'}
            </Button>
          </form>
        )}

        {result && (
          <p className={`mt-4 p-4 text-center rounded-lg border ${
            result.type === 'error' 
              ? 'bg-red-900/50 border-red-800/50 text-red-200' 
              : 'bg-green-900/50 border-green-800/50 text-green-200'
          }`}>
            {result.message}
          </p>
        )}

        <div className="flex flex-col gap-4 mt-6 text-center text-sm">
          <Link to="/login" className="text-zinc-400 hover:text-white transition-colors">
            Back to login
          </Link>
          <div className="text-zinc-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white hover:underline transition-colors font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
