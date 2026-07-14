import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchApi } from '@/services/api.client'
import { fetchMovieDetails, fetchTVDetails } from '@/services/tmdb.service'
import { MediaCard } from '@/components/features/MediaCard'

export default function PlaylistDetails() {
  const { id } = useParams<{ id: string }>()
  const [playlist, setPlaylist] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)

    fetchApi(`/playlists/${id}`).then((playlistData) => {
      setPlaylist(playlistData)
      
      if (playlistData) {
        fetchApi(`/playlists/${id}/items`).then((itemsData) => {
          if (!itemsData || itemsData.length === 0) {
            setItems([])
            setLoading(false)
            return
          }

          Promise.all(itemsData.map(async (item: any) => {
            try {
              if (item.media_type === 'movie') {
                return await fetchMovieDetails(item.tmdb_id.toString())
              } else {
                return await fetchTVDetails(item.tmdb_id.toString())
              }
            } catch {
              return null
            }
          })).then(resolvedItems => {
            setItems(resolvedItems.filter(Boolean))
            setLoading(false)
          })
        }).catch(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="p-12 text-center text-zinc-500">Loading playlist...</div>
  }

  if (!playlist) {
    return <div className="p-12 text-center">Playlist not found.</div>
  }

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in">
      <Link to="/profile" className="text-zinc-500 hover:text-white mb-8 inline-block transition-colors">
        ← Back to Profile
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-2">
          {playlist.name}
        </h1>
        <p className="text-zinc-500">
          {items.length} {items.length === 1 ? 'item' : 'items'}
          {playlist.type === 'system' && (
            <span className="ml-3 inline-block px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-300">
              System Playlist
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {items.map((item: any, i) => (
          <MediaCard key={`${item.id}-${i}`} media={item} />
        ))}
        {items.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 italic border border-dashed border-zinc-800 rounded-xl">
            This playlist is empty. Go find some good stuff!
          </div>
        )}
      </div>
    </main>
  )
}
