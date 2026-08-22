import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom'
import { fetchApi } from '@/services/api.client'
import { toggleFollow } from '@/services/user.service'
import { getPlaylists, deletePlaylist } from '@/services/playlist.service'
import { getPublicProfile, getPublicPlaylists, getFollowers, getFollowing, searchUsers } from '@/services/public.service'
import { EditProfileModal } from '@/components/features/EditProfileModal'
import { CreatePlaylistModal } from '@/components/features/CreatePlaylistModal'
import { LibraryOverview } from '@/components/features/LibraryOverview'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Share2, Bookmark, UserPlus, UserMinus, X, Sparkles, Search, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

import { UserAvatar } from '@/components/common/UserAvatar'
import { usePageMetadata } from '@/components/common/RouteMetadata'
import { clearSessionHint, hasSessionHint } from '@/utils/auth'

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
    const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false)

    usePageMetadata(profile?.username ? `@${profile.username}` : undefined, profile?.bio || undefined, profile?.avatarUrl || undefined)

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

    useEffect(() => {
        const initializeProfile = async () => {
            try {
                setLoading(true)
                let currentUser = null
                // Force authentication to view ANY profile
                if (!hasSessionHint()) {
                    const currentPath = encodeURIComponent(location.pathname)
                    navigate(`/login?redirect=${currentPath}`, { replace: true })
                    return
                }

                // 1. Fetch current logged-in user if token exists
                try {
                    currentUser = await fetchApi('/users/me')
                } catch {
                    clearSessionHint()
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
    }, [username, navigate, location.pathname])

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

    const customPlaylists = playlists.filter(playlist => playlist.type === 'custom')

    return (
        <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
            <section className="relative z-30 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" aria-label="Profile tools">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Community</p>
                    <h1 className="mt-1 text-xl font-bold text-white">Profiles and collections</h1>
                </div>
                <div className="relative w-full lg:max-w-sm">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
                    <Input type="search" aria-label="Find a FilmedIn member" placeholder="Find a member" className="h-11 w-full rounded-xl border border-white/10 bg-[#141513] pl-11 pr-4 text-sm text-white placeholder:text-zinc-500" value={userQuery} onChange={(event) => setUserQuery(event.target.value)} onFocus={() => userQuery.trim() && setIsUserSearchOpen(true)} />
                    {isUserSearchOpen && userQuery.trim() && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#171817] p-1.5 shadow-2xl">
                            {searchingUsers ? <p className="px-3 py-3 text-xs text-zinc-500">Searching members...</p> : userResults.length ? userResults.map((user) => (
                                <button key={user._id} type="button" onClick={() => { setIsUserSearchOpen(false); setUserQuery(''); navigate(`/u/${user.username}`) }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.05]">
                                    <UserAvatar avatarUrl={user.avatarUrl} username={user.username} className="h-8 w-8 border border-white/10" />
                                    <span className="truncate text-sm font-medium text-zinc-200">@{user.username}</span>
                                </button>
                            )) : <p className="px-3 py-3 text-xs text-zinc-500">No members found.</p>}
                        </div>
                    )}
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#171817]">
                <div className="relative h-40 overflow-hidden bg-[#22231f] sm:h-52">
                    {profile.bannerUrl && <img src={profile.bannerUrl} alt="" className="h-full w-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#171817] via-black/20 to-transparent" />
                </div>
                <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="-mt-12 flex min-w-0 flex-col items-start gap-4 sm:-mt-14 sm:flex-row sm:items-end">
                            <UserAvatar avatarUrl={profile.avatarUrl} username={profile.username} className="h-24 w-24 shrink-0 border-4 border-[#171817] text-3xl shadow-xl sm:h-28 sm:w-28" />
                            <div className="min-w-0 pb-1">
                                <h2 className="truncate text-3xl font-black tracking-tight text-white">{profile.username}</h2>
                                <p className="mt-1 text-sm text-zinc-500">@{profile.username}</p>
                                {profile.bio && <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">{profile.bio}</p>}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {isOwner ? (
                                <>
                                    <EditProfileModal currentAvatar={profile.avatarUrl} currentBanner={profile.bannerUrl} currentBio={profile.bio} currentUsername={profile.username} autoOpen={new URLSearchParams(location.search).get('edit') === 'true'} />
                                    <button type="button" onClick={handleShareProfile} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/[0.05] hover:text-white"><Share2 className="h-4 w-4" aria-hidden="true" />Share</button>
                                </>
                            ) : (
                                <>
                                    <button type="button" onClick={handleToggleFollow} disabled={followLoading} className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${isFollowing ? 'border border-white/10 text-zinc-300 hover:bg-white/[0.05]' : 'bg-[#e8e0d3] text-[#111210] hover:bg-white'}`}>{isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{isFollowing ? 'Following' : 'Follow'}</button>
                                    <Link to={`/blend/${profile.username}`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/[0.05] hover:text-white"><Sparkles className="h-4 w-4" aria-hidden="true" />Taste Blend</Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-3 divide-x divide-white/[0.08] border-t border-white/[0.08] pt-5 sm:max-w-md">
                        <div><span className="block text-lg font-bold text-white">{customPlaylists.length}</span><span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Collections</span></div>
                        <button type="button" onClick={openFollowersModal} className="px-5 text-left"><span className="block text-lg font-bold text-white">{followersCount}</span><span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Followers</span></button>
                        <button type="button" onClick={openFollowingModal} className="px-5 text-left"><span className="block text-lg font-bold text-white">{followingCount}</span><span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Following</span></button>
                    </div>
                </div>
            </section>

            <LibraryOverview playlists={playlists} username={profile.username} isOwner={isOwner} />

            <section className="space-y-5" aria-labelledby="collections-heading">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Curated lists</p><h2 id="collections-heading" className="mt-1 text-2xl font-bold text-white">{isOwner ? 'Your playlists' : `${profile.username}'s playlists`}</h2><p className="mt-1 text-sm text-zinc-500">Movies and shows grouped around a mood, franchise, person, or idea.</p></div>
                    {isOwner && <button type="button" onClick={() => setIsCreatePlaylistOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8e0d3] px-4 py-2.5 text-xs font-bold text-[#111210] hover:bg-white"><Plus className="h-4 w-4" aria-hidden="true" />New playlist</button>}
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#171817]">
                  <div className="divide-y divide-white/[0.07]">
                    {customPlaylists.map((playlist) => (
                        <article key={playlist.id} className="group flex min-w-0 items-center gap-4 px-4 py-4 transition-colors hover:bg-white/[0.03] sm:px-5">
                          <Link to={`/playlist/${playlist.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                            <div className="relative h-16 w-24 shrink-0">
                              {playlist.preview_posters?.length ? playlist.preview_posters.slice(0, 3).map((poster: string, index: number) => <img key={poster} src={poster} alt="" className="absolute top-0 h-16 w-11 rounded-md border border-[#171817] object-cover shadow-md" style={{ left: `${index * 22}px`, zIndex: index + 1 }} />) : <span className="flex h-16 w-24 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025]"><Bookmark className="h-5 w-5 text-zinc-600" aria-hidden="true" /></span>}
                            </div>
                            <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-zinc-100 sm:text-base">{playlist.name}</h3><p className="mt-1 text-xs text-zinc-500">{playlist.playlist_items?.[0]?.count || 0} titles · Personal playlist</p></div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-white" aria-hidden="true" />
                          </Link>
                          {isOwner && <button type="button" onClick={() => handleDeletePlaylist(playlist.id)} aria-label={`Delete ${playlist.name}`} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white/[0.05] hover:text-zinc-200"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>}
                        </article>
                    ))}
                    {!customPlaylists.length && <div className="px-6 py-12 text-center"><Bookmark className="mx-auto h-6 w-6 text-zinc-600" aria-hidden="true" /><p className="mt-3 text-sm font-semibold text-zinc-300">{isOwner ? 'Create your first personal playlist.' : 'No personal playlists yet.'}</p>{isOwner && <button type="button" onClick={() => setIsCreatePlaylistOpen(true)} className="mt-4 text-xs font-bold text-[#d2b48c] hover:text-white">Create a playlist</button>}</div>}
                  </div>
                </div>
            </section>

            <CreatePlaylistModal
                isOpen={isCreatePlaylistOpen}
                onClose={() => setIsCreatePlaylistOpen(false)}
                onCreated={async () => setPlaylists(await getPlaylists())}
            />

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
