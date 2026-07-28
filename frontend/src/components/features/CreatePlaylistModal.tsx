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
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div 
        className="clay-modal w-full max-w-md p-8 animate-in zoom-in-95 text-left" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4 text-white">Create New Playlist</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Playlist Title *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Favorite Sci-Fi Movies"
                className="w-full clay-input text-white border-none py-2.5 px-3.5"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this playlist about?"
                className="w-full h-24 min-h-[5rem] clay-input p-3 text-sm transition-colors placeholder:text-zinc-600 resize-none text-white border-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={() => { setName(''); setDescription(''); onClose(); }} 
              className="px-5 py-2.5 clay-button-secondary text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !name.trim()} 
              className="px-6 py-2.5 clay-button-primary text-xs disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
