import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchApi } from '@/lib/api'
import { signout } from '@/lib/auth'
import { getPlaylists, createPlaylist, deletePlaylist } from '@/lib/playlists'
import { AvatarSelector } from '@/components/AvatarSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, LogOut, Trash2 } from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [playlists, setPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newPlaylistName, setNewPlaylistName] = useState('')

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

  const handleSignOut = async () => {
    await signout()
    navigate('/')
  }

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) return
    const res = await createPlaylist(newPlaylistName)
    if (res.success) {
      setPlaylists([res.playlist, ...playlists])
      setNewPlaylistName('')
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
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover bg-zinc-100" />
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
            <AvatarSelector currentAvatar={profile?.avatar_url} />
          </div>
        </div>
        
        <Button onClick={handleSignOut} variant="outline" className="border-red-900/50 text-red-500 hover:bg-red-950/30 hover:text-red-400">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-semibold">Your Playlists</h2>
          <form onSubmit={handleCreatePlaylist} className="flex items-center gap-2">
            <Input 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name..."
              className="bg-zinc-900 border-zinc-800 w-[200px]"
            />
            <Button type="submit" className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900 transition-colors">
              <Link to={`/profile/playlist/${playlist.id}`} className="block">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-white text-zinc-100">{playlist.name}</h3>
                <p className="text-sm text-zinc-500">{playlist.playlist_items?.[0]?.count || 0} items</p>
                {playlist.type === 'system' && (
                  <span className="absolute top-4 right-4 text-xs font-medium bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">
                    System
                  </span>
                )}
              </Link>
              {playlist.type === 'custom' && (
                <button 
                  onClick={() => handleDeletePlaylist(playlist.id)}
                  className="absolute bottom-4 right-4 text-zinc-600 hover:text-red-500 transition-colors p-2"
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
    </main>
  )
}
