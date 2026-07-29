'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus } from 'lucide-react'
import { addToList, getPlaylists } from '@/services/playlist.service'
import toast from 'react-hot-toast'

export function AddToListButton({ tmdbId, mediaType }: { tmdbId: number, mediaType: 'movie' | 'tv' }) {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlaylists().then((data) => {
      setPlaylists(data)
      setLoading(false)
    })
  }, [])

  const handleAdd = async (playlistId: string) => {
    try {
      const res = await addToList(playlistId, tmdbId, mediaType)
      toast.success(res.message || "Added to playlist!")
    } catch (e) {
      toast.error("Error adding to playlist.")
    }
  }

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors bg-[var(--theme-dark-hover)] text-white hover:bg-zinc-700 border-0 h-10 px-4 rounded-full">
        <Plus className="w-4 h-4" /> Add to List
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[var(--theme-dark)] border-white/10 text-zinc-100 min-w-[200px]">
        {loading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : playlists.length > 0 ? (
          playlists.map((pl) => (
            <DropdownMenuItem 
              key={pl.id} 
              onClick={() => handleAdd(pl.id)}
              className="cursor-pointer focus:bg-[var(--theme-dark-hover)] focus:text-zinc-50"
            >
              {pl.name}
            </DropdownMenuItem>
          ))
        ) : hasToken ? (
          <DropdownMenuItem disabled>No lists created yet. Go to profile to create one.</DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>Sign in to add to lists</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
