import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Folder } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: playlists } = await supabase
    .from('playlists')
    .select('*, playlist_items(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const watchedPlaylist = playlists?.find(p => p.name === 'Watched')
  const watchedCount = watchedPlaylist?.playlist_items?.[0]?.count || 0

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
      <header className="flex flex-col gap-2 border-b border-zinc-800 pb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">{profile?.username || 'User Profile'}</h1>
            <p className="text-zinc-400">Total Media Watched: <span className="text-white font-medium">{watchedCount}</span></p>
          </div>
          <form action={signout}>
            <Button variant="ghost" className="text-zinc-400 hover:text-white">Sign out</Button>
          </form>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-6">Your Playlists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {playlists?.map(pl => (
            <Link 
              key={pl.id} 
              href={`/profile/playlist/${pl.id}`}
              className="group flex flex-col gap-3 p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                <Folder className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-white font-medium truncate">{pl.name}</h3>
                <p className="text-zinc-500 text-sm mt-1">{pl.playlist_items?.[0]?.count || 0} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
