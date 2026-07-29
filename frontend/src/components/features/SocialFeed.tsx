import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Heart, MessageSquare, Share2, Star, Film, Sparkles, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface FeedPost {
  id: string
  user: {
    username: string
    avatarUrl?: string
  }
  media: {
    id: number
    title: string
    posterPath: string
    type: 'movie' | 'tv'
    year: string
  }
  rating: number
  review?: string
  likesCount: number
  isLiked?: boolean
  timestamp: string
  commentsCount: number
}

const INITIAL_POSTS: FeedPost[] = [
  {
    id: '1',
    user: { username: 'cinema_lover', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    media: { id: 27205, title: 'Inception', posterPath: '/ljsZTbVsrQSqZgWeep2P1Oi2jM.jpg', type: 'movie', year: '2010' },
    rating: 5,
    review: 'A breathtaking masterpiece of storytelling and visual editing. Hans Zimmer score gives goosebumps every single rewatch!',
    likesCount: 24,
    timestamp: '2 hours ago',
    commentsCount: 5
  },
  {
    id: '2',
    user: { username: 'alex_film', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    media: { id: 1396, title: 'Breaking Bad', posterPath: '/ztWlWyDUtODzUiTs9KKbQUrSJzD.jpg', type: 'tv', year: '2008' },
    rating: 5,
    review: 'Just finished rewatching Ozymandias. Peak television history. Nothing comes close to Bryan Cranston performance.',
    likesCount: 42,
    timestamp: '4 hours ago',
    commentsCount: 12
  },
  {
    id: '3',
    user: { username: 'sarah_cinephile', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    media: { id: 157336, title: 'Interstellar', posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', type: 'movie', year: '2014' },
    rating: 4.5,
    review: 'The docking scene alone makes this one of the greatest sci-fi experiences ever created for cinema.',
    likesCount: 19,
    timestamp: '6 hours ago',
    commentsCount: 3
  }
]

export function SocialFeed() {
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS)
  const [newReview, setNewReview] = useState('')
  const [mediaTitle, setMediaTitle] = useState('')
  const [rating, setRating] = useState(5)
  const [showLogModal, setShowLogModal] = useState(false)

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        const isLiked = !p.isLiked
        return { ...p, isLiked, likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1 }
      }
      return p
    }))
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mediaTitle.trim()) {
      toast.error('Please enter a movie or TV show title')
      return
    }

    const newPost: FeedPost = {
      id: Date.now().toString(),
      user: { username: 'tanmayhutt' },
      media: {
        id: Math.floor(Math.random() * 10000),
        title: mediaTitle,
        posterPath: '/ljsZTbVsrQSqZgWeep2P1Oi2jM.jpg',
        type: 'movie',
        year: new Date().getFullYear().toString()
      },
      rating,
      review: newReview,
      likesCount: 1,
      isLiked: true,
      timestamp: 'Just now',
      commentsCount: 0
    }

    setPosts([newPost, ...posts])
    setNewReview('')
    setMediaTitle('')
    setShowLogModal(false)
    toast.success('Logged review to your social feed!')
  }

  return (
    <div className="space-y-6">
      {/* Create Social Post Card */}
      <div className="clay-card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-3">
          <UserAvatar username="tanmayhutt" className="w-10 h-10 border border-white/10" />
          <button 
            onClick={() => setShowLogModal(true)}
            className="flex-1 text-left px-4 py-2.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-full text-xs text-zinc-400 hover:text-zinc-200 transition-all"
          >
            What movie or show did you watch today? Log a review...
          </button>
        </div>

        {showLogModal && (
          <form onSubmit={handleCreatePost} className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-in fade-in">
            <input 
              type="text" 
              placeholder="Title (e.g. Dune Part Two)"
              value={mediaTitle}
              onChange={e => setMediaTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--theme-dark)] border border-white/10 rounded-xl text-zinc-200 focus:outline-none placeholder:text-zinc-500"
            />
            
            <textarea 
              placeholder="Write your review or thoughts..."
              value={newReview}
              onChange={e => setNewReview(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs bg-[var(--theme-dark)] border border-white/10 rounded-xl text-zinc-200 focus:outline-none placeholder:text-zinc-500 resize-none"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                <span className="text-xs text-zinc-400 mr-2">Rating:</span>
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    className="hover:scale-125 transition-transform"
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-zinc-200 transition-all flex items-center gap-1.5"
                >
                  <Send size={12} /> Post Log
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Social Posts Stream */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="clay-card p-5 space-y-4 hover:border-white/20 transition-all">
            {/* Header: User Info */}
            <div className="flex items-center justify-between">
              <Link to={`/u/${post.user.username}`} className="flex items-center gap-3 group">
                <UserAvatar avatarUrl={post.user.avatarUrl} username={post.user.username} className="w-10 h-10 border border-white/10" />
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                    {post.user.username}
                  </h4>
                  <p className="text-[10px] text-zinc-400">{post.timestamp}</p>
                </div>
              </Link>
              
              <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{post.rating} / 5</span>
              </div>
            </div>

            {/* Content: Movie & Review */}
            <div className="flex gap-4 bg-black/30 p-3 rounded-2xl border border-white/5">
              <Link to={`/${post.media.type}/${post.media.id}`} className="w-16 h-24 rounded-xl overflow-hidden shrink-0 clay-poster">
                <img 
                  src={`https://image.tmdb.org/t/p/w185${post.media.posterPath}`} 
                  alt={post.media.title} 
                  className="w-full h-full object-cover"
                />
              </Link>

              <div className="flex-1 flex flex-col justify-center min-w-0">
                <Link to={`/${post.media.type}/${post.media.id}`} className="hover:underline">
                  <h3 className="text-sm font-bold text-white truncate">{post.media.title}</h3>
                </Link>
                <p className="text-[11px] text-zinc-400 mb-2">{post.media.type === 'movie' ? 'Movie' : 'TV Show'} • {post.media.year}</p>
                {post.review && (
                  <p className="text-xs text-zinc-300 leading-relaxed italic line-clamp-3">
                    "{post.review}"
                  </p>
                )}
              </div>
            </div>

            {/* Footer: Social Actions (Like, Comment, Share) */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 font-medium transition-colors ${post.isLiked ? 'text-rose-500' : 'hover:text-rose-400'}`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500' : ''}`} />
                <span>{post.likesCount}</span>
              </button>

              <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>{post.commentsCount} Comments</span>
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Post link copied!')
                }}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
