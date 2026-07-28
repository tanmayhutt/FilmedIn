'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createPlaylist, addToList } from '@/services/playlist.service'
import { useSavedMedia } from '@/context/SavedMediaContext'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  mediaToAdd?: {
    tmdbId: number
    mediaType: 'movie' | 'tv'
    title: string
  }
  onCreated?: () => void
}

export function CreatePlaylistModal({ isOpen, onClose, mediaToAdd, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshSaved } = useSavedMedia()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!name.trim()) return

    setLoading(true)
    try {
      const res = await createPlaylist(name.trim(), description.trim())
      if (res.error || !res.playlist) {
        toast.error(res.error || 'Failed to create playlist')
        setLoading(false)
        return
      }

      const newPlId = res.playlist.id || res.playlist._id

      if (mediaToAdd) {
        await addToList(newPlId, mediaToAdd.tmdbId, mediaToAdd.mediaType)
        toast.success(`Created & added "${mediaToAdd.title}" to "${name.trim()}"!`)
      } else {
        toast.success(`Playlist "${name.trim()}" created!`)
      }

      await refreshSaved()
      if (onCreated) onCreated()
      setName('')
      setDescription('')
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Error creating playlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 text-left" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4 text-white">Create New Playlist</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Playlist Title *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Favorite Sci-Fi Movies"
                className="w-full bg-zinc-950 border-zinc-800 text-white"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this playlist about?"
                className="w-full h-24 min-h-[5rem] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm transition-colors outline-none placeholder:text-zinc-600 focus-visible:border-zinc-700 resize-none text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { setName(''); setDescription(''); onClose(); }} 
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !name.trim()} 
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300 disabled:opacity-50 font-medium"
            >
              {loading ? 'Creating...' : 'Create Playlist'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
