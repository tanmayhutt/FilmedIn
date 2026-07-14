import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { fetchMovieDetails, fetchTVDetails } from '@/lib/tmdb'
import { MediaCard } from '@/components/MediaCard'

export default async function PlaylistPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: playlist } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!playlist) return notFound()

  if (playlist.user_id !== user.id) {
    return notFound()
  }

  const { data: items } = await supabase
    .from('playlist_items')
    .select('*')
    .eq('playlist_id', playlist.id)
    .order('added_at', { ascending: false })

  const mediaItems = await Promise.all((items || []).map(async (item) => {
    try {
      if (item.media_type === 'movie') {
        return await fetchMovieDetails(item.tmdb_id.toString())
      } else {
        return await fetchTVDetails(item.tmdb_id.toString())
      }
    } catch (e) {
      return null
    }
  }))

  const validMediaItems = mediaItems.filter(Boolean)

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
      <div className="mb-2">
        <Link href="/profile" className="text-zinc-400 hover:text-zinc-200 text-sm">
          &larr; Back to Profile
        </Link>
      </div>

      <header className="flex flex-col gap-2 mb-4">
        <h1 className="text-4xl font-bold tracking-tight text-white">{playlist.name}</h1>
        <p className="text-zinc-400">{validMediaItems.length} items</p>
      </header>

      <section>
        {validMediaItems.length > 0 ? (
          <div className="flex flex-wrap gap-6">
            {validMediaItems.map(media => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        ) : (
          <div className="text-zinc-500 py-12 text-center text-lg bg-zinc-900/50 rounded-xl border border-zinc-800">
            This playlist is empty.
          </div>
        )}
      </section>
    </main>
  )
}
