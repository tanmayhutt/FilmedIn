import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function SignupPage(props: {
  searchParams: Promise<{ message: string }>
}) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto pt-20">
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground" action={signup}>
        <h1 className="text-3xl font-semibold text-zinc-100 mb-6 text-center">Create an account</h1>
        <label className="text-md font-medium text-zinc-300" htmlFor="username">
          Username
        </label>
        <Input
          className="mb-4 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
          name="username"
          placeholder="moviefan99"
          required
        />
        <label className="text-md font-medium text-zinc-300" htmlFor="email">
          Email
        </label>
        <Input
          className="mb-4 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
          name="email"
          placeholder="you@example.com"
          required
        />
        <label className="text-md font-medium text-zinc-300" htmlFor="password">
          Password
        </label>
        <Input
          className="mb-6 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        <Button className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300 w-full mb-2 h-12">
          Sign Up
        </Button>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-red-900/50 text-red-400 text-center rounded-md border border-red-800">
            {searchParams.message}
          </p>
        )}
      </form>
      <div className="text-center mt-4">
        <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-200">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  )
}
