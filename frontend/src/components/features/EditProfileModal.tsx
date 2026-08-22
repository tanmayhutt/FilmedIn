import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { PRESET_AVATARS } from '@/utils/avatars'
import { PRESET_BANNERS } from '@/utils/banners'
import { updateProfile, uploadCustomAvatar, uploadCustomBanner, deleteAccount } from '@/services/user.service'
import { signout } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Upload, Camera, User, Image as ImageIcon, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  currentAvatar?: string
  currentBanner?: string
  currentBio?: string
  currentUsername: string
  autoOpen?: boolean
}

export function EditProfileModal({ currentAvatar, currentBanner, currentBio, currentUsername, autoOpen }: Props) {
  const [isOpen, setIsOpen] = useState(autoOpen || false)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(currentUsername)
  const [avatar, setAvatar] = useState(currentAvatar || '')
  const [banner, setBanner] = useState(currentBanner || '')
  const [bio, setBio] = useState(currentBio || '')
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerFileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadCustomAvatar(formData)
      if (res.success && res.url) {
        setAvatar(res.url)
        toast.success('Avatar uploaded!')
      } else {
        toast.error(res.error || 'Failed to upload avatar')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadCustomBanner(formData)
      if (res.success && res.url) {
        setBanner(res.url)
        toast.success('Banner uploaded!')
      } else {
        toast.error(res.error || 'Failed to upload banner')
      }
    } catch {
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
    const res = await updateProfile({ username, avatarUrl: avatar, bannerUrl: banner, bio })
    setLoading(false)
    
    if (res.success) {
      toast.success('Profile updated!')
      setIsOpen(false)
      window.location.href = `/u/${username}`
    } else {
      toast.error(res.error || 'Failed to update profile')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'delete') {
      return toast.error('Type "delete" to confirm')
    }
    setDeleting(true)
    const res = await deleteAccount()
    if (res.success) {
      await signout()
      toast.success('Account deleted successfully')
      window.location.href = '/'
    } else {
      toast.error(res.error || 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-2.5 clay-button-secondary text-xs"
      >
        Edit Profile
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="clay-modal p-0 max-w-3xl w-full max-h-[85vh] flex flex-col relative animate-in zoom-in-95 overflow-hidden rounded-2xl border border-white/15 shadow-2xl bg-[#171817]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 shrink-0 bg-[#171817]">
              <h2 className="text-xl font-bold text-white tracking-tight">Edit Profile</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors"
                aria-label="Close profile editor"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            
            {/* Scrollable modal body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Side: Avatar */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="relative group cursor-pointer w-28 h-28 rounded-full overflow-hidden border border-white/10 shadow-xl">
                    <img src={avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt="Avatar" className="w-full h-full object-cover bg-[var(--theme-dark)]" />
                    <div 
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="text-white w-7 h-7" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 border border-white/10 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Avatar
                  </button>
                </div>

                {/* Right Side: Details */}
                <div className="flex-1 flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block flex items-center gap-2">
                      <User className="w-4 h-4 text-zinc-500" /> Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 select-none font-bold">@</span>
                      <Input 
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="pl-9 clay-input text-white border-none py-2.5"
                        placeholder="username"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">Letters, numbers, and underscores only.</p>
                  </div>

                  {/* Bio Field */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 block">
                      Bio
                    </label>
                    <textarea 
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={2}
                      maxLength={160}
                      className="w-full px-3.5 py-2.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 resize-none"
                      placeholder="Tell cinephiles about your favorite movies & TV shows..."
                    />
                    <div className="text-right text-[10px] text-zinc-500">{bio.length}/160</div>
                  </div>
                </div>
              </div>

              {/* Avatar Presets */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 block">
                  Or pick a preset avatar
                </label>
                <div className="grid grid-cols-5 gap-3 max-h-[16vh] overflow-y-auto pr-2 pb-2 custom-scrollbar">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                        avatar === url ? 'border-[#d2b48c] scale-105' : 'border-white/10 hover:border-zinc-600'
                      }`}
                    >
                      <img src={url} alt="Preset avatar" className="w-full h-full object-cover bg-zinc-100" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Banner Selection */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 block flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-zinc-500" /> Profile Banner Backdrop
                </label>
                <div className="grid grid-cols-3 gap-2.5 max-h-[18vh] overflow-y-auto pr-2 pb-2 custom-scrollbar mb-3">
                  {PRESET_BANNERS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setBanner(preset.url)}
                      className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all group ${
                        banner === preset.url ? 'border-[#d2b48c] scale-105' : 'border-white/10 hover:border-zinc-600'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center p-1">
                        <span className="text-[10px] font-bold text-white text-center leading-tight truncate">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  ref={bannerFileInputRef}
                  onChange={handleBannerUpload}
                />

                <button 
                  type="button"
                  onClick={() => bannerFileInputRef.current?.click()}
                  disabled={loading}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Custom Banner Image
                </button>
              </div>

              {/* Delete Account Warning Box */}
              {showDeleteConfirm && (
                <div className="p-4 border border-red-900/50 bg-red-950/20 rounded-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs text-red-400 font-medium">
                    Warning: This action is permanent. All your playlists and items will be deleted.
                  </p>
                  <div className="flex gap-3">
                    <Input 
                      value={deleteInput}
                      onChange={e => setDeleteInput(e.target.value)}
                      placeholder="Type 'delete' to confirm"
                      className="bg-[var(--theme-dark)] border-red-900/50 text-white text-xs focus:border-red-500"
                    />
                    <Button 
                      onClick={handleDeleteAccount}
                      disabled={deleteInput !== 'delete' || deleting}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs disabled:opacity-50"
                    >
                      {deleting ? <Spinner className="w-4 h-4" /> : 'Delete Forever'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center bg-[#171817] shrink-0 z-10">
              <button 
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors font-medium"
                type="button"
              >
                Delete Account
              </button>
              <div className="flex gap-3">
                <Button onClick={() => setIsOpen(false)} variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 text-xs">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading || deleting} className="bg-[#e8e0d3] hover:bg-white text-[#111210] text-xs px-6">
                  {loading ? <Spinner className="w-4 h-4" /> : 'Save Changes'}
                </Button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  )
}
