'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginClientAction } from '@/app/auth/actions'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const res = await loginClientAction({ email, password })
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        router.push('/profile')
        router.refresh()
      } else {
        setError('An unknown error occurred')
      }
    } catch (err: any) {
      console.error(err)
      setError('CRITICAL: Server connection failed. Check Vercel Environment Variables!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto pt-20">
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-semibold text-zinc-100 mb-6 text-center">Welcome back</h1>
        
        <label className="text-md font-medium text-zinc-300" htmlFor="email">Email</label>
        <Input
          className="mb-4 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <label className="text-md font-medium text-zinc-300" htmlFor="password">Password</label>
        <div className="relative mb-6">
          <Input
            className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700 pr-10"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button type="submit" disabled={loading} className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300 w-full mb-2 h-12">
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        
        {error && (
          <p className="mt-4 p-4 bg-red-900/50 text-red-400 text-center rounded-md border border-red-800">
            {error}
          </p>
        )}
      </form>
      <div className="text-center mt-4 flex flex-col gap-2">
        <Link href="/signup" className="text-sm text-zinc-400 hover:text-zinc-200">
          Don't have an account? Sign up
        </Link>
        <Link href="/forgot-username" className="text-sm text-zinc-400 hover:text-zinc-200">
          Forgot Username?
        </Link>
      </div>
    </div>
  )
}
