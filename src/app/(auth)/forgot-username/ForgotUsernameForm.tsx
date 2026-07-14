'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUsernameByEmail } from '@/app/auth/actions'
import Link from 'next/link'

export function ForgotUsernameForm() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<{ type: 'error' | 'success', message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await getUsernameByEmail(email)
      if (res.error) {
        setResult({ type: 'error', message: res.error })
      } else if (res.username) {
        setResult({ type: 'success', message: `Your username is: ${res.username}` })
      }
    } catch (err) {
      setResult({ type: 'error', message: 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto pt-20">
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-semibold text-zinc-100 mb-6 text-center">Forgot Username</h1>
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
        
        <Button disabled={loading} className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300 w-full mb-2 h-12">
          {loading ? 'Searching...' : 'Find Username'}
        </Button>
        
        {result && (
          <div className={`mt-4 p-4 text-center rounded-md border ${result.type === 'success' ? 'bg-green-950/50 text-green-400 border-green-900' : 'bg-red-900/50 text-red-400 border-red-800'}`}>
            <p>{result.message}</p>
            {result.type === 'success' && (
              <Link href="/login" className="block mt-4 underline text-green-300 hover:text-green-200">Go to Login</Link>
            )}
          </div>
        )}
      </form>
      <div className="text-center mt-4 flex flex-col gap-2">
        <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-200">
          Remember it? Sign in
        </Link>
      </div>
    </div>
  )
}
