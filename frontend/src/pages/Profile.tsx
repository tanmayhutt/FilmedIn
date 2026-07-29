import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom'
import { fetchApi } from '@/services/api.client'
import { signout } from '@/services/auth.service'
import { toggleFollow } from '@/services/user.service'
import { getPlaylists, createPlaylist, deletePlaylist } from '@/services/playlist.service'
import { getPublicProfile, getPublicPlaylists, getFollowers, getFollowing, searchUsers } from '@/services/public.service'
import { EditProfileModal } from '@/components/features/EditProfileModal'
import { useSavedMedia } from '@/context/SavedMediaContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, LogOut, Trash2, Share2, Bookmark, UserPlus, UserMinus, User, X, Sparkles, Search } from 'lucide-react'
import { PRESET_AVATARS } from '@/utils/avatars'
import toast from 'react-hot-toast'

import { UserAvatar } from '@/components/common/UserAvatar'

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

    // Dedicated User Search state on Profile
    const [userQuery, setUserQuery] = useState('')
    const [userResults, setUserResults] = useState<any[]>([])
    const [searchingUsers, setSearchingUsers] = useState(false)
    const [isUserSearchOpen, setIsUserSearchOpen] = useState(false)

    useEffect(() => {
        if (!userQuery.trim()) { setUserResults([]); setIsUserSearchOpen(false); return }
        const timer = setTimeout(async () => {
            setSearchingUsers(true)
            try {
                const data = await searchUsers(userQuery)
                setUserResults(data.slice(0, 5))
                setIsUserSearchOpen(true)
            } catch (e) { console.error(e) }
            finally { setSearchingUsers(false) }
        }, 300)
        return () => clearTimeout(timer)
    }, [userQuery])
    const [followersList, setFollowersList] = useState<any[]>([])
    const [followingList, setFollowingList] = useState<any[]>([])
    const [modalLoading, setModalLoading] = useState(false)
    const [pfpTheme, setPfpTheme] = useState<{ r: number; g: number; b: number } | null>(null)

    useEffect(() => {
        if (!profile) return

        const url = profile.avatarUrl || ''
        const isPreset = !url || url.includes('api.dicebear.com') || PRESET_AVATARS.some(p => url.includes(p))

        if (isPreset) {
            setPfpTheme(null)
            return
        }

        // Helper to generate a unique vivid RGB color from string seed
        const getUniqueColor = (seed: string) => {
            let hash = 0
            for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
            const h = Math.abs(hash) % 360
            const s = 0.65
            const l = 0.5
            const c = (1 - Math.abs(2 * l - 1)) * s
            const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
            const m = l - c / 2
            let rP = 0, gP = 0, bP = 0
            if (h < 60) { rP = c; gP = x; bP = 0 }
            else if (h < 120) { rP = x; gP = c; bP = 0 }
            else if (h < 180) { rP = 0; gP = c; bP = x }
            else if (h < 240) { rP = 0; gP = x; bP = c }
            else if (h < 300) { rP = x; gP = 0; bP = c }
            else { rP = c; gP = 0; bP = x }
            return {
                r: Math.round((rP + m) * 255),
                g: Math.round((gP + m) * 255),
                b: Math.round((bP + m) * 255)
            }
        }

        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.src = url
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas')
                canvas.width = 16
                canvas.height = 16
                const ctx = canvas.getContext('2d')
                if (!ctx) return setPfpTheme(getUniqueColor(url + (profile.username || '')))
                ctx.drawImage(img, 0, 0, 16, 16)
                const data = ctx.getImageData(0, 0, 16, 16).data
                let r = 0, g = 0, b = 0, count = 0
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
                    if (avg > 25 && avg < 235) {
                        r += data[i]
                        g += data[i + 1]
                        b += data[i + 2]
                        count++
                    }
                }
                if (count > 0) {
                    setPfpTheme({
                        r: Math.round(r / count),
                        g: Math.round(g / count),
                        b: Math.round(b / count)
                    })
                } else {
                    setPfpTheme(getUniqueColor(url + (profile.username || '')))
                }
            } catch {
                setPfpTheme(getUniqueColor(url + (profile.username || '')))
            }
        }
        img.onerror = () => {
            setPfpTheme(getUniqueColor(url + (profile.username || '')))
        }
    }, [profile?.avatarUrl, profile?.username])

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

    const handleCreatePlaylist = async () => {
        const name = window.prompt('Enter playlist title:')
        if (!name || !name.trim()) return
        try {
            await createPlaylist(name.trim())
            toast.success('Playlist created!')
            const ownerPlaylists = await getPlaylists()
            setPlaylists(ownerPlaylists)
        } catch (err) {
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

    const themeR = pfpTheme?.r ?? 99
    const themeG = pfpTheme?.g ?? 102
    const themeB = pfpTheme?.b ?? 241

    return (
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-in fade-in relative space-y-10">
            {/* ✦ Premium Organic Profile Header ✦ */}
            <div className="clay-card p-0 overflow-visible relative border border-white/10 rounded-[2.5rem]">
                {/* Cinematic Header Cover Backdrop */}
                <div 
                    className="h-48 sm:h-64 w-full relative overflow-hidden rounded-t-[2.5rem] transition-all duration-700 bg-[var(--theme-dark)]"
                    style={{
                        background: profile.bannerUrl ? undefined : `linear-gradient(135deg, rgba(${themeR}, ${themeG}, ${themeB}, 0.85), rgba(${Math.max(15, themeR - 60)}, ${Math.max(15, themeG - 60)}, ${Math.max(15, themeB - 60)}, 0.98))`
                    }}
                >
                    {profile.bannerUrl && (
                        <img 
                            src={profile.bannerUrl} 
                            alt="Cover Banner" 
                            className="w-full h-full object-cover" 
                        />
                    )}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b22] via-transparent to-transparent opacity-95" />
                    
                    {/* Organic Wavy Contour SVG Layer */}
                    <div className="absolute bottom-0 inset-x-0 pointer-events-none opacity-40">
                        <svg className="w-full h-12 text-[#1b1b22]" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 60C240 100 480 20 720 60C960 100 1200 30 1440 60V120H0V60Z" fill="currentColor"/>
                        </svg>
                    </div>
                </div>

                {/* Main Profile Info Row */}
                <div className="px-6 sm:px-10 pb-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
                        {/* Avatar */}
                        <UserAvatar
                            avatarUrl={profile.avatarUrl}
                            username={profile.username}
                            className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-[#1b1b22] shadow-2xl shrink-0 text-4xl"
                        />

                        {/* User Details */}
                        <div className="space-y-1 mb-1">
                            <div className="flex items-center justify-center sm:justify-start gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    {profile.username}
                                </h1>
                                {!isOwner && (
                                    <span 
                                        className="text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider clay-badge"
                                        style={{ background: `rgba(${themeR}, ${themeG}, ${themeB}, 0.3)` }}
                                    >
                                        Cinephile
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-400 font-medium">
                                @{profile.username} {profile.bio ? `• ${profile.bio}` : ''}
                            </p>
                        </div>
                    </div>

                    {/* Social Stats Row */}
                    <div className="flex items-center gap-6 bg-black/40 border border-white/5 px-6 py-3 rounded-2xl backdrop-blur-md">
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-base">{playlists.length}</span>
                            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Playlists</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <button onClick={openFollowersModal} className="flex flex-col items-center hover:text-white transition-colors group">
                            <span className="text-white font-bold text-base">{followersCount}</span>
                            <span className="text-zinc-400 uppercase tracking-wider text-[10px] group-hover:text-zinc-200">Followers</span>
                        </button>
                        <div className="w-px h-6 bg-white/10" />
                        <button onClick={openFollowingModal} className="flex flex-col items-center hover:text-white transition-colors group">
                            <span className="text-white font-bold text-base">{followingCount}</span>
                            <span className="text-zinc-400 uppercase tracking-wider text-[10px] group-hover:text-zinc-200">Following</span>
                        </button>
                    </div>
                </div>

                {/* Profile Action Toolbar & User Search */}
                <div className="px-6 sm:px-10 pb-6 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                    {/* User Search Socket */}
                    <div className="relative z-50">
                        <div className="relative group w-64">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400 group-focus-within:text-white transition-colors pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Search cinephiles..."
                                className="w-full h-9 pl-9 pr-3 text-xs bg-black/50 border border-white/10 rounded-xl placeholder:text-zinc-500 focus:border-white/30 transition-all"
                                value={userQuery}
                                onChange={(e) => setUserQuery(e.target.value)}
                                onFocus={() => userQuery.trim() && userResults.length > 0 && setIsUserSearchOpen(true)}
                            />
                        </div>

                        {isUserSearchOpen && userQuery.trim().length > 0 && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-[#1b1b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 animate-in fade-in slide-in-from-top-2">
                                {searchingUsers ? (
                                    <div className="px-3 py-2 text-zinc-500 text-xs">Searching users...</div>
                                ) : userResults.length > 0 ? (
                                    userResults.map(u => (
                                        <button
                                            key={u._id}
                                            onClick={() => {
                                                setIsUserSearchOpen(false)
                                                setUserQuery('')
                                                navigate(`/u/${u.username}`)
                                            }}
                                            className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-white/5 transition-colors text-left rounded-xl"
                                        >
                                            <UserAvatar avatarUrl={u.avatarUrl} username={u.username} className="w-6 h-6 border border-white/20" />
                                            <span className="text-xs font-medium text-zinc-200 truncate">{u.username}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-zinc-500 text-xs">No users found.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {isOwner ? (
                            <>
                                <EditProfileModal 
                                    currentAvatar={profile.avatarUrl}
                                    currentBanner={profile.bannerUrl}
                                    currentBio={profile.bio}
                                    currentUsername={profile.username}
                                    autoOpen={new URLSearchParams(location.search).get('edit') === 'true'}
                                />
                                <button onClick={handleShareProfile} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 border border-white/10 rounded-xl flex items-center gap-2 transition-all">
                                    <Share2 className="w-3.5 h-3.5" />
                                    Share
                                </button>
                                <button onClick={handleSignOut} className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 border border-rose-500/20 rounded-xl flex items-center gap-2 transition-all">
                                    <LogOut className="w-3.5 h-3.5" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={handleToggleFollow} 
                                    disabled={followLoading}
                                    className="px-5 py-2 text-xs font-bold transition-all min-w-[100px] rounded-xl flex items-center justify-center gap-2"
                                    style={{
                                        background: isFollowing 
                                            ? 'rgba(255, 255, 255, 0.1)'
                                            : `linear-gradient(145deg, rgb(${themeR}, ${themeG}, ${themeB}), rgba(${themeR}, ${themeG}, ${themeB}, 0.8))`,
                                        color: '#ffffff'
                                    }}
                                >
                                    {isFollowing ? <><UserMinus className="w-3.5 h-3.5" /> Unfollow</> : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
                                </button>
                                <a href={`/blend/${profile.username}`} target="_blank" rel="noopener noreferrer">
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 border border-white/10 rounded-xl flex items-center gap-2 transition-all">
                                        <Sparkles className="w-3.5 h-3.5" /> Taste Blend
                                    </button>
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Playlists Section ── */}
            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-white">{isOwner ? 'Your Playlists & Watchlists' : `${profile.username}'s Playlists`}</h2>
                    {isOwner && (
                        <button 
                            onClick={handleCreatePlaylist} 
                            className="px-5 py-2 text-xs font-bold transition-all rounded-full flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200"
                        >
                            <Plus className="w-4 h-4" />
                            Create Playlist
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {playlists.map((playlist) => (
                        <div key={playlist.id} className="group relative clay-card overflow-hidden h-48">
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
                                <div className="absolute inset-0 bg-[var(--theme-dark)]" />
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
                        <div className="col-span-full py-12 text-center text-zinc-500 italic border border-dashed border-white/10 rounded-xl">
                            {isOwner ? 'No playlists yet. Create one above!' : 'No playlists yet.'}
                        </div>
                    )}
                </div>
            </section>

            {/* Followers / Following Modals */}
            {(isFollowersModalOpen || isFollowingModalOpen) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[var(--theme-dark)] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[var(--theme-bg)]/50">
                            <h3 className="text-lg font-semibold text-white">
                                {isFollowersModalOpen ? 'Followers' : 'Following'}
                            </h3>
                            <button 
                                onClick={() => {
                                    setIsFollowersModalOpen(false)
                                    setIsFollowingModalOpen(false)
                                }}
                                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[var(--theme-dark-hover)] transition-colors"
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
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--theme-dark-hover)] transition-colors group"
                                            >
                                                <UserAvatar avatarUrl={user.avatarUrl} username={user.username} className="w-10 h-10 border border-white/20" />
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
