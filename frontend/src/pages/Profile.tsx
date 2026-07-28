import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom'
import { fetchApi } from '@/services/api.client'
import { signout } from '@/services/auth.service'
import { toggleFollow } from '@/services/user.service'
import { getPlaylists, createPlaylist, deletePlaylist } from '@/services/playlist.service'
import { getPublicProfile, getPublicPlaylists, getFollowers, getFollowing } from '@/services/public.service'
import { EditProfileModal } from '@/components/features/EditProfileModal'
import { useSavedMedia } from '@/context/SavedMediaContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, LogOut, Trash2, Share2, Bookmark, UserPlus, UserMinus, User, X, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
    const navigate = useNavigate()
    const location = useLocation()
    const { username } = useParams<{ username?: string }>()

    const [profile, setProfile] = useState<any>(null)
    const [playlists, setPlaylists] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isOwner, setIsOwner] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [followLoading, setFollowLoading] = useState(false)
    const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false)
    const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false)
    const [followersList, setFollowersList] = useState<any[]>([])
    const [followingList, setFollowingList] = useState<any[]>([])
    const [modalLoading, setModalLoading] = useState(false)

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
                    setFollowersCount(currentUser.followersCount || 0)
                    setFollowingCount(currentUser.followingCount || 0)
                    const ownerPlaylists = await getPlaylists()
                    setPlaylists(ownerPlaylists)
                } else {
                    const publicProfile = await getPublicProfile(username)
                    setProfile(publicProfile)
                    if (publicProfile) {
                        setFollowersCount(publicProfile.followersCount || 0)
                        setFollowingCount(publicProfile.followingCount || 0)
                        setIsFollowing(publicProfile.isFollowing || false)
                    }
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

    const handleToggleFollow = async () => {
        if (!profile?.username || followLoading) return
        setFollowLoading(true)
        
        // Optimistic update
        const previousIsFollowing = isFollowing
        const previousCount = followersCount
        
        setIsFollowing(!isFollowing)
        setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1)
        
        const res = await toggleFollow(profile.username)
        setFollowLoading(false)
        
        if (!res.success) {
            // Revert on failure
            setIsFollowing(previousIsFollowing)
            setFollowersCount(previousCount)
            toast.error(res.error || 'Failed to update follow status')
        }
    }

    const openFollowersModal = async () => {
        if (!profile?.username) return
        setIsFollowersModalOpen(true)
        setModalLoading(true)
        const list = await getFollowers(profile.username)
        setFollowersList(list)
        setModalLoading(false)
    }

    const openFollowingModal = async () => {
        if (!profile?.username) return
        setIsFollowingModalOpen(true)
        setModalLoading(true)
        const list = await getFollowing(profile.username)
        setFollowingList(list)
        setModalLoading(false)
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
                    
                    <div className="flex items-center gap-6 text-sm text-zinc-300 mb-6 font-medium">
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-lg">{playlists.length}</span>
                            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Playlists</span>
                        </div>
                        <div className="w-px h-8 bg-zinc-800"></div>
                        <button onClick={openFollowersModal} className="flex flex-col items-center hover:text-white transition-colors group">
                            <span className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{followersCount}</span>
                            <span className="text-zinc-500 uppercase tracking-wider text-[10px] group-hover:text-zinc-400">Followers</span>
                        </button>
                        <div className="w-px h-8 bg-zinc-800"></div>
                        <button onClick={openFollowingModal} className="flex flex-col items-center hover:text-white transition-colors group">
                            <span className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{followingCount}</span>
                            <span className="text-zinc-500 uppercase tracking-wider text-[10px] group-hover:text-zinc-400">Following</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {isOwner ? (
                            <>
                                <EditProfileModal 
                                    currentAvatar={profile.avatarUrl} 
                                    currentUsername={profile.username}
                                    autoOpen={new URLSearchParams(location.search).get('edit') === 'true'}
                                />
                                <Button onClick={handleShareProfile} variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share Profile
                                </Button>
                                <Button onClick={handleSignOut} variant="outline" className="border-red-900/50 text-red-500 hover:bg-red-950/30 hover:text-red-400">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button 
                                    onClick={handleToggleFollow} 
                                    disabled={followLoading}
                                    variant={isFollowing ? "outline" : "default"}
                                    className={isFollowing 
                                        ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white min-w-[120px]" 
                                        : "bg-blue-600 hover:bg-blue-500 text-white min-w-[120px]"
                                    }
                                >
                                    {isFollowing ? <><UserMinus className="w-4 h-4 mr-2" /> Unfollow</> : <><UserPlus className="w-4 h-4 mr-2" /> Follow</>}
                                </Button>
                                <a 
                                    href={`/blend/${profile.username}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <Button 
                                        variant="outline" 
                                        className="border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white font-medium"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2 text-zinc-400" />
                                        Compare Taste
                                    </Button>
                                </a>
                                <Button onClick={handleShareProfile} variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <section>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-semibold">{isOwner ? 'Your Playlists' : 'Playlists'}</h2>
                    {isOwner && (
                        <Button 
                            onClick={() => openCreateModal({
                                onCreated: async () => {
                                    const ownerPlaylists = await getPlaylists();
                                    setPlaylists(ownerPlaylists);
                                }
                            })} 
                            className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300"
                        >
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

            {/* Followers / Following Modals */}
            {(isFollowersModalOpen || isFollowingModalOpen) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50">
                            <h3 className="text-lg font-semibold text-white">
                                {isFollowersModalOpen ? 'Followers' : 'Following'}
                            </h3>
                            <button 
                                onClick={() => {
                                    setIsFollowersModalOpen(false)
                                    setIsFollowingModalOpen(false)
                                }}
                                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-2 flex-1">
                            {modalLoading ? (
                                <div className="flex justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {((isFollowersModalOpen ? followersList : followingList) || []).length === 0 ? (
                                        <div className="text-center p-8 text-zinc-500">
                                            No {isFollowersModalOpen ? 'followers' : 'following'} yet.
                                        </div>
                                    ) : (
                                        (isFollowersModalOpen ? followersList : followingList).map((user) => (
                                            <Link 
                                                key={user._id} 
                                                to={`/u/${user.username}`}
                                                onClick={() => {
                                                    setIsFollowersModalOpen(false)
                                                    setIsFollowingModalOpen(false)
                                                }}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <User className="w-4 h-4 text-zinc-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-zinc-200 group-hover:text-white truncate">
                                                    {user.username}
                                                </span>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
