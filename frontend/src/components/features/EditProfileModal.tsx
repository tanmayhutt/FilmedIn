'use client'

import { useState, useRef } from 'react'
import { PRESET_AVATARS } from '@/utils/avatars'
import { updateProfile, uploadCustomAvatar } from '@/services/user.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Upload, Camera, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  currentAvatar?: string
  currentUsername: string
  autoOpen?: boolean
}

export function EditProfileModal({ currentAvatar, currentUsername, autoOpen }: Props) {
  const [isOpen, setIsOpen] = useState(autoOpen || false)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(currentUsername)
  const [avatar, setAvatar] = useState(currentAvatar || '')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadCustomAvatar(formData)
      if (res.success) {
        setAvatar(res.url)
      } else {
        toast.error(res.error || 'Failed to upload image')
      }
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (username.length < 3) {
      return toast.error('Username must be at least 3 characters')
    }
    
    setLoading(true)
    const res = await updateProfile({ username, avatarUrl: avatar })
    setLoading(false)
    
    if (res.success && res.token) {
      localStorage.setItem('token', res.token)
      toast.success('Profile updated!')
      setIsOpen(false)
      window.location.href = `/u/${username}`
    } else {
      toast.error(res.error || 'Failed to update profile')
    }
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="mt-4 bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-full px-6"
      >
        Edit Profile
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full flex flex-col gap-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h2 className="text-2xl font-semibold text-white">Edit Profile</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-2"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Side: Avatar */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-2 border-zinc-800 hover:border-zinc-500 transition-all">
                  <img src={avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt="Avatar" className="w-full h-full object-cover bg-zinc-100" />
                  <div 
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="text-white w-8 h-8" />
                  </div>
                </div>
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
                  variant="secondary"
                  className="w-full text-xs"
                >
                  <Upload className="w-3 h-3 mr-2" /> Upload New
                </Button>
              </div>

              {/* Right Side: Details & Presets */}
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <label className="text-sm text-zinc-400 font-medium mb-1 block flex items-center gap-2">
                    <User className="w-4 h-4" /> Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 select-none">@</span>
                    <Input 
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="pl-8 bg-zinc-900 border-zinc-800 text-white focus:border-blue-500"
                      placeholder="username"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Letters, numbers, and underscores only. Must be unique.</p>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 font-medium mb-2 block">Or pick a preset avatar</label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[25vh] overflow-y-auto pr-2 pb-2 custom-scrollbar">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAvatar(url)}
                        className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                          avatar === url ? 'border-blue-500 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <img src={url} alt="Preset avatar" className="w-full h-full object-cover bg-zinc-100" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-2">
              <Button onClick={() => setIsOpen(false)} variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white min-w-[100px]">
                {loading ? <Spinner className="w-4 h-4" /> : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
