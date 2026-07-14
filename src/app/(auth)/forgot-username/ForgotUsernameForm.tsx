'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginWithOtpClientAction, verifyOtpClientAction } from '@/app/auth/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function ForgotUsernameForm() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [result, setResult] = useState<{ type: 'error' | 'success', message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await loginWithOtpClientAction(email)
      if (res.error) {
        setResult({ type: 'error', message: res.error })
      } else {
        setResult({ type: 'success', message: 'A 6-digit code has been sent to your email.' })
        setStep('otp')
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
        router.push('/profile')
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
        <h1 className="text-3xl font-semibold text-zinc-100 mb-6 text-center">Login via Email OTP</h1>
        
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
            <label className="text-md font-medium text-zinc-300" htmlFor="email">
              Account Email
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
              {loading ? 'Sending Code...' : 'Send Login Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-2">
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
              {loading ? 'Verifying...' : 'Verify & Login'}
            </Button>
          </form>
        )}
        
        {result && (
          <div className={`mt-4 p-4 text-center rounded-md border ${result.type === 'success' ? 'bg-green-950/50 text-green-400 border-green-900' : 'bg-red-900/50 text-red-400 border-red-800'}`}>
            <p>{result.message}</p>
          </div>
        )}
      </div>
      
      <div className="text-center mt-4 flex flex-col gap-2">
        <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-200">
          Login with Password
        </Link>
        <Link href="/signup" className="text-sm text-zinc-400 hover:text-zinc-200">
          Don't have an account? Sign up
        </Link>
      </div>
    </div>
  )
}
