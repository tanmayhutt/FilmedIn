import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom'
import { fetchApi } from '@/services/api.client'
import { signout } from '@/services/auth.service'
import { getPlaylists, createPlaylist, deletePlaylist } from '@/services/playlist.service'
import { getPublicProfile, getPublicPlaylists } from '@/services/public.service'
import { EditProfileModal } from '@/components/features/EditProfileModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, LogOut, Trash2, Share2, Bookmark } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
    const navigate = useNavigate()
    const location = useLocation()
    const { username } = useParams<{ username?: string }>()

    const [profile, setProfile] = useState<any>(null)
    const [playlists, setPlaylists] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newPlaylistName, setNewPlaylistName] = useState('')
    const [newPlaylistDesc, setNewPlaylistDesc] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isOwner, setIsOwner] = useState(false)

    useEffect(() => {
        const initializeProfile = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('token')
                let currentUser = null
                // Force authentication to view ANY profile
                if (!token) {
                    const currentPath = encodeURIComponent(location.pathname)
                    navigate(`/login?redirect=${currentPath}`, { replace: true })
                    return
                }

                // 1. Fetch current logged-in user if token exists
                try {
                    currentUser = await fetchApi('/users/me')
                } catch {
                    localStorage.removeItem('token')
                    const currentPath = encodeURIComponent(location.pathname)
                    navigate(`/login?redirect=${currentPath}`, { replace: true })
                    return
                }
                // 2. Handle legacy `/profile` route
                if (!username) {
                    if (currentUser) {
                        navigate(`/u/${currentUser.username}`, { replace: true })
                    } else {
                        navigate('/login', { replace: true })
                    }
                    return
                }

                // 3. Determine if current user is the owner
                const owner = currentUser && currentUser.username === username
                setIsOwner(owner)

                // 4. Fetch profile and playlists
                if (owner) {
                    setProfile(currentUser)
                    const ownerPlaylists = await getPlaylists()
                    setPlaylists(ownerPlaylists)
                } else {
                    const publicProfile = await getPublicProfile(username)
                    setProfile(publicProfile)
                    if (publicProfile && publicProfile._id) {
                        const publicPlaylists = await getPublicPlaylists(publicProfile._id)
                        setPlaylists(publicPlaylists)
                    }
                }
            } catch (err) {
                console.error('Failed to load profile', err)
            } finally {
                setLoading(false)
            }
        }

        initializeProfile()
    }, [username, navigate])

    const handleShareProfile = async () => {
        if (!profile?.username) return
        const url = `${window.location.origin}/u/${profile.username}`
        try {
            await navigator.clipboard.writeText(url)
            toast.success('Public profile link copied!')
        } catch (err) {
            console.error('Error sharing:', err)
            toast.error('Failed to copy link')
        }
    }

    const handleSignOut = async () => {
        await signout()
        navigate('/')
    }

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPlaylistName.trim()) return
        const res = await createPlaylist(newPlaylistName, newPlaylistDesc)
        if (res.success) {
            setPlaylists([res.playlist, ...playlists])
            setNewPlaylistName('')
            setNewPlaylistDesc('')
            setIsModalOpen(false)
            toast.success('Playlist created!')
        } else {
            toast.error('Failed to create playlist')
        }
    }

    const handleDeletePlaylist = async (id: string) => {
        const res = await deletePlaylist(id)
        if (res.success) {
            setPlaylists(playlists.filter(p => p.id !== id))
        }
    }

    if (loading) {
        return <div className="p-12 text-center text-zinc-500">Loading profile...</div>
    }

    if (!profile) {
        return null // Avoid crashing if we are navigating away or profile is missing
    }

    return (
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in relative">
            {/* Profile Header Redesign */}
            <div className="relative mb-16 rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800">
                <div className="h-48 sm:h-64 bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 w-full opacity-80"></div>
                <div className="px-6 sm:px-12 pb-8 flex flex-col items-center -mt-16 sm:-mt-20 relative z-10">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-zinc-900 bg-zinc-800 shadow-2xl mb-4 relative group">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-500 uppercase">
                                {profile.username?.[0] || '?'}
                            </div>
                        )}
                        {/* No longer use AvatarSelector overlay here, handled by EditProfileModal */}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 text-center flex items-center gap-2">
                        {profile.username}
                        {!isOwner && (
                            <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full font-medium tracking-wide uppercase border border-white/10">
                                Public
                            </span>
                        )}
                    </h1>
                    <p className="text-zinc-400 max-w-lg text-center mb-6">
                        FilmedIn Member • {playlists.length} Playlists
                    </p>

                    {isOwner && (
                        <div className="flex items-center gap-3">
                            <EditProfileModal 
                                currentAvatar={profile.avatarUrl} 
                                currentUsername={profile.username}
                                autoOpen={new URLSearchParams(location.search).get('edit') === 'true'}
                            />
                            <Button onClick={handleShareProfile} variant="outline" className="mt-4 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Profile
                            </Button>
                            <Button onClick={handleSignOut} variant="outline" className="mt-4 border-red-900/50 text-red-500 hover:bg-red-950/30 hover:text-red-400">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <section>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-semibold">{isOwner ? 'Your Playlists' : 'Playlists'}</h2>
                    {isOwner && (
                        <Button onClick={() => setIsModalOpen(true)} className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300">
                            <Plus className="w-4 h-4 mr-2" />
                            Create
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {playlists.map((playlist) => (
                        <div key={playlist.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors h-48">
                            {/* Collage Background */}
                            {playlist.preview_posters && playlist.preview_posters.length > 0 ? (
                                <div className="absolute inset-0 flex">
                                    {playlist.preview_posters.map((poster: string, i: number) => (
                                        <div
                                            key={i}
                                            className="h-full flex-1 bg-cover bg-center"
                                            style={{
                                                backgroundImage: `url(${poster})`,
                                                opacity: 0.6
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-zinc-900" />
                            )}

                            {/* Gradient overlay for readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                            <Link to={`/playlist/${playlist.id}`} className="absolute inset-0 flex flex-col justify-end p-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg group-hover:text-white text-zinc-100 drop-shadow-md">{playlist.name}</h3>
                                    {playlist.type === 'system' && (
                                        <Bookmark className="w-4 h-4 text-zinc-400" />
                                    )}
                                </div>
                                <p className="text-sm text-zinc-400 drop-shadow-md">{playlist.playlist_items?.[0]?.count || 0} items</p>
                            </Link>

                            {isOwner && playlist.type === 'custom' && (
                                <button
                                    onClick={() => handleDeletePlaylist(playlist.id)}
                                    className="absolute top-3 right-3 text-zinc-400 hover:text-red-500 hover:bg-black/50 rounded-full p-2 transition-all z-10 backdrop-blur-md bg-black/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    {playlists.length === 0 && (
                        <div className="col-span-full py-12 text-center text-zinc-500 italic border border-dashed border-zinc-800 rounded-xl">
                            {isOwner ? 'No playlists yet. Create one above!' : 'No playlists yet.'}
                        </div>
                    )}
                </div>
            </section>

            {/* Create Playlist Modal */}
            {isOwner && isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
                        <h3 className="text-xl font-semibold mb-4 text-white">Create New Playlist</h3>
                        <form onSubmit={handleCreatePlaylist}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Playlist Title *</label>
                                    <Input
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        placeholder="e.g. Favorite Sci-Fi Movies"
                                        className="w-full bg-zinc-950 border-zinc-800"
                                        autoFocus
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                                    <textarea
                                        value={newPlaylistDesc}
                                        onChange={(e) => setNewPlaylistDesc(e.target.value)}
                                        placeholder="What is this playlist about?"
                                        className="w-full h-24 min-h-[5rem] rounded-lg border border-input border-zinc-800 bg-zinc-950 px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!newPlaylistName.trim()} className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300 disabled:opacity-50">
                                    Create Playlist
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
