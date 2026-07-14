'use client'

import { useState, useRef } from 'react'
import { PRESET_AVATARS } from '@/lib/avatars'
import { updateAvatar, uploadCustomAvatar } from '@/app/profile/actions'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Upload } from 'lucide-react'

interface Props {
  currentAvatar?: string
}

export function AvatarSelector({ currentAvatar }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleSelect = async (url: string) => {
    setLoading(true)
    await updateAvatar(url)
    setLoading(false)
    setIsOpen(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    await uploadCustomAvatar(formData)
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
            
            <div className="flex flex-col gap-6">
              <div className="flex justify-center">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Custom Image
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-zinc-900 px-4 text-sm text-zinc-500">Or pick a preset</span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    disabled={loading}
                    onClick={() => handleSelect(url)}
                    className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                      currentAvatar === url ? 'border-zinc-100 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <img src={url} alt="Preset avatar" className="w-full h-full object-cover bg-zinc-100" />
                  </button>
                ))}
              </div>
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
