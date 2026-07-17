import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchApi } from '@/services/api.client'
import { signout } from '@/services/auth.service'
import { getPlaylists, createPlaylist, deletePlaylist } from '@/services/playlist.service'
import { AvatarSelector } from '@/components/features/AvatarSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, LogOut, Trash2, Share2, Bookmark } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [playlists, setPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    Promise.all([
      fetchApi('/users/me'),
      getPlaylists()
    ]).then(([profileData, playlistsData]) => {
      setProfile(profileData)
      setPlaylists(playlistsData)
      setLoading(false)
    }).catch((err) => {
      console.error(err)
      localStorage.removeItem('token')
      navigate('/login')
    })
  }, [navigate])

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/profile` // Using general profile URL since public profile routes aren't built yet
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.username}'s FilmedIn Profile`,
          text: `Check out ${profile?.username}'s cinematic journey on FilmedIn!`,
          url: url
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Profile link copied to clipboard!')
      }
    } catch (err) {
      console.error('Error sharing:', err)
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

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-zinc-900 border-4 border-zinc-800 shrink-0">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover bg-zinc-100" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-3xl font-medium">
                {profile?.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
              {profile?.username || 'User Profile'}
            </h1>
            <p className="text-zinc-500 mb-4">{profile?.email}</p>
            <AvatarSelector currentAvatar={profile?.avatarUrl} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleShareProfile} variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white">
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
          <Button onClick={handleSignOut} variant="outline" className="border-red-900/50 text-red-500 hover:bg-red-950/30 hover:text-red-400">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-semibold">Your Playlists</h2>
          <Button onClick={() => setIsModalOpen(true)} className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
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

              <Link to={`/profile/playlist/${playlist.id}`} className="absolute inset-0 flex flex-col justify-end p-5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg group-hover:text-white text-zinc-100 drop-shadow-md">{playlist.name}</h3>
                  {playlist.type === 'system' && (
                    <Bookmark className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
                <p className="text-sm text-zinc-400 drop-shadow-md">{playlist.playlist_items?.[0]?.count || 0} items</p>
              </Link>
              
              {playlist.type === 'custom' && (
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
              No playlists yet. Create one above!
            </div>
          )}
        </div>
      </section>

      {/* Create Playlist Modal */}
      {isModalOpen && (
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
