import { useState } from 'react'

interface UserAvatarProps {
  avatarUrl?: string
  username?: string
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function UserAvatar({ avatarUrl, username = 'Cinephile', className = '', size = 'md' }: UserAvatarProps) {
  const [hasError, setHasError] = useState(false)

  const initial = username ? username.charAt(0).toUpperCase() : '?'
  
  // Deterministic color gradient based on username
  const gradients = [
    'from-rose-500 to-purple-600',
    'from-amber-500 to-rose-600',
    'from-indigo-500 to-cyan-500',
    'from-emerald-500 to-teal-600',
    'from-fuchsia-500 to-[#1b1b22]',
    'from-[#f43f5e] to-[#8b5cf6]'
  ]

  let charCodeSum = 0
  for (let i = 0; i < username.length; i++) {
    charCodeSum += username.charCodeAt(i)
  }
  const bgGradient = gradients[charCodeSum % gradients.length]

  const fallbackUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`
  const src = avatarUrl && avatarUrl.trim().length > 0 ? avatarUrl : fallbackUrl

  return (
    <div className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-br ${bgGradient} text-white font-bold select-none ${className}`}>
      {!hasError && src ? (
        <img
          src={src}
          alt={username}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="drop-shadow-md">{initial}</span>
      )}
    </div>
  )
}
