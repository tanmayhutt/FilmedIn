import { useState } from 'react'

interface UserAvatarProps {
  avatarUrl?: string
  username?: string
  className?: string
}

export function UserAvatar({ avatarUrl, username = 'Cinephile', className = '' }: UserAvatarProps) {
  const [hasError, setHasError] = useState(false)

  const initial = username ? username.charAt(0).toUpperCase() : '?'
  
  // Deterministic color gradient based on username
  const gradients = [
    'from-stone-500 to-stone-800',
    'from-zinc-400 to-zinc-700',
    'from-neutral-500 to-neutral-900',
    'from-stone-400 to-neutral-700',
    'from-zinc-500 to-neutral-900',
    'from-stone-500 to-zinc-800'
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
