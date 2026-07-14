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
import { addToList, getPlaylists } from '@/lib/playlists'

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
      alert(res.message || "Added to playlist!")
    } catch (e) {
      alert("Error adding to playlist.")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors bg-zinc-800 text-white hover:bg-zinc-700 border-0 h-10 px-4 rounded-full">
        <Plus className="w-4 h-4" /> Add to List
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-100 min-w-[200px]">
        {loading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : playlists.length > 0 ? (
          playlists.map((pl) => (
            <DropdownMenuItem 
              key={pl.id} 
              onClick={() => handleAdd(pl.id)}
              className="cursor-pointer focus:bg-zinc-800 focus:text-zinc-50"
            >
              {pl.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>Sign in to add to lists</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
