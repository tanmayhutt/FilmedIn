import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { fetchApi } from '@/services/api.client'
import { fetchMovieDetails, fetchTVDetails } from '@/services/tmdb.service'
import { removeFromList } from '@/services/playlist.service'
import { ArrowLeft, ListVideo, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePageMetadata } from '@/components/common/RouteMetadata'
import { hasSessionHint } from '@/utils/auth'
import { PlaylistCover } from '@/components/features/PlaylistCover'

export default function PlaylistDetails() {
    const { id } = useParams<{ id: string }>()
    const [playlist, setPlaylist] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)

    usePageMetadata(playlist?.name, playlist?.description || (playlist ? `${playlist.name}, a curated FilmedIn playlist.` : undefined))

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (!hasSessionHint()) {
            const currentPath = encodeURIComponent(location.pathname)
            navigate(`/login?redirect=${currentPath}`, { replace: true })
            return
        }
        fetchApi('/users/me').then(setCurrentUser).catch(() => {})
    }, [navigate, location.pathname])

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

    const handleRemoveItem = async (tmdbId: number, mediaType: 'movie' | 'tv') => {
        if (!id) return
        const res = await removeFromList(id, tmdbId, mediaType)
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
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <button
                type="button"
                onClick={() => {
                    if (window.history.length > 2) {
                        window.history.back()
                    } else {
                        window.location.href = '/'
                    }
                }}
                className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-white"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>

            <header className="mb-8 flex flex-col gap-5 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end">
                <PlaylistCover posters={items.slice(0, 4).map(item => item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '').filter(Boolean)} fallback={ListVideo} className="h-28 w-28 sm:h-36 sm:w-36" />
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Playlist</p>
                    <h1 className="mt-2 break-words text-3xl font-black tracking-tight text-white sm:text-5xl">{playlist.name}</h1>
                    {playlist.description && <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{playlist.description}</p>}
                    <p className="mt-3 text-xs font-semibold text-zinc-500">{items.length} {items.length === 1 ? 'title' : 'titles'}</p>
                </div>
            </header>

            <section aria-label={`${playlist.name} titles`} className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#171817]">
              <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_8rem_6rem_3rem] gap-4 border-b border-white/[0.07] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600 md:grid">
                <span>#</span><span>Title</span><span>Type</span><span>Rating</span><span />
              </div>
              <ol className="divide-y divide-white/[0.07]">
                {items.map((item: any, i) => {
                    const isOwner = currentUser && currentUser._id === playlist.userId
                    const mediaType = item.media_type || item.mediaType || (item.title ? 'movie' : 'tv')
                    const title = item.title || item.name
                    const year = (item.release_date || item.first_air_date || '').slice(0, 4)
                    return (
                      <li key={`${item.id}-${i}`} className="group grid grid-cols-[2rem_minmax(0,1fr)_2.5rem] items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:px-5 md:grid-cols-[2.5rem_minmax(0,1fr)_8rem_6rem_3rem] md:gap-4">
                        <span className="text-xs tabular-nums text-zinc-600">{i + 1}</span>
                        <Link to={`/${mediaType === 'movie' ? 'movie' : 'tv'}/${item.id}`} className="flex min-w-0 items-center gap-3">
                          <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md bg-white/[0.04]">{item.poster_path ? <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center"><ListVideo className="h-4 w-4 text-zinc-700" /></span>}</div>
                          <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-zinc-100 group-hover:text-white">{title}</h2>{year && <p className="mt-1 text-xs text-zinc-600">{year}</p>}</div>
                        </Link>
                        <span className="hidden text-xs capitalize text-zinc-500 md:block">{mediaType === 'movie' ? 'Movie' : 'TV show'}</span>
                        <span className="hidden text-xs tabular-nums text-zinc-500 md:block">{item.vote_average ? item.vote_average.toFixed(1) : '—'}</span>
                        {isOwner ? <button type="button" onClick={() => handleRemoveItem(item.id, mediaType)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white/[0.05] hover:text-zinc-200" aria-label={`Remove ${title} from playlist`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button> : <span />}
                      </li>
                    )
                })}
              </ol>
                {items.length === 0 && (
                    <div className="px-6 py-16 text-center">
                        <ListVideo className="mx-auto h-6 w-6 text-zinc-700" aria-hidden="true" />
                        <p className="mt-3 text-sm font-semibold text-zinc-400">This playlist is empty.</p>
                        <Link to="/explore" className="mt-3 inline-block text-xs font-bold text-[#d2b48c] hover:text-white">Explore titles</Link>
                    </div>
                )}
            </section>
        </main>
    )
}
