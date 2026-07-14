'use client'

import { useState } from 'react'
import { PRESET_AVATARS } from '@/lib/avatars'
import { updateAvatar } from '@/app/profile/actions'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Image from 'next/image'

interface Props {
  currentAvatar?: string
}

export function AvatarSelector({ currentAvatar }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const handleSelect = async (url: string) => {
    setLoading(true)
    await updateAvatar(url)
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="mt-4 bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-full px-6"
      >
        Edit Avatar
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full flex flex-col gap-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h2 className="text-2xl font-semibold text-white">Choose an Avatar</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-2"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto pr-2 pb-2">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => handleSelect(url)}
                  className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                    currentAvatar === url ? 'border-zinc-100 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <Image src={url} alt="Preset avatar" fill className="object-cover bg-zinc-100" />
                </button>
              ))}
            </div>

            {loading && (
              <div className="absolute inset-0 bg-zinc-900/80 rounded-2xl flex items-center justify-center flex-col gap-4">
                <Spinner className="w-8 h-8 text-white" />
                <p className="text-zinc-300 font-medium">Updating profile...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
