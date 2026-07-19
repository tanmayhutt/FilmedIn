import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { fetchApi } from '@/services/api.client'
import { fetchMovieDetails, fetchTVDetails } from '@/services/tmdb.service'
import { MediaCard } from '@/components/features/MediaCard'
import { removeFromList } from '@/services/playlist.service'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PlaylistDetails() {
    const { id } = useParams<{ id: string }>()
    const [playlist, setPlaylist] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            const currentPath = encodeURIComponent(location.pathname)
            navigate(`/login?redirect=${currentPath}`, { replace: true })
            return
        }
        fetchApi('/users/me').then(setCurrentUser).catch(() => {})
    }, [navigate])

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

    const handleRemoveItem = async (tmdbId: number) => {
        if (!id) return
        const res = await removeFromList(id, tmdbId)
        if (res.success) {
            setItems(items.filter(item => item.id !== tmdbId))
            toast.success('Item removed')
        } else {
            toast.error('Failed to remove item')
        }
    }

    if (loading) {
        return <div className="p-12 text-center text-zinc-500">Loading playlist...</div>
    }

    if (!playlist) {
        return <div className="p-12 text-center">Playlist not found.</div>
    }

    return (
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in">
            <button
                onClick={() => {
                    if (window.history.length > 2) {
                        window.history.back()
                    } else {
                        window.location.href = '/'
                    }
                }}
                className="text-zinc-500 hover:text-white mb-8 inline-block transition-colors"
            >
                ← Back
            </button>

            <div className="mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-2">
                    {playlist.name}
                </h1>
                {playlist.description && (
                    <p className="text-lg text-zinc-300 mb-4 max-w-2xl">{playlist.description}</p>
                )}
                <p className="text-zinc-500">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {items.map((item: any, i) => {
                    const isOwner = currentUser && currentUser._id === playlist.userId
                    return (
                        <MediaCard
                            key={`${item.id}-${i}`}
                            media={item}
                            actionButton={
                                isOwner ? (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleRemoveItem(item.id)
                                        }}
                                        className="p-2 bg-black/60 hover:bg-red-500/90 text-white rounded-full backdrop-blur-md transition-colors"
                                        title="Remove from playlist"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                ) : undefined
                            }
                        />
                    )
                })}
                {items.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-500 italic border border-dashed border-zinc-800 rounded-xl">
                        This playlist is empty. Go find some good stuff!
                    </div>
                )}
            </div>
        </main>
    )
}
