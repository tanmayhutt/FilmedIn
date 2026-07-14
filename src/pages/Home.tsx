import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { TrendingMovies, TrendingTV } from '@/components/TrendingMedia'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col items-center justify-center space-y-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 mt-12 sm:mt-24">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-center bg-gradient-to-br from-white to-zinc-500 text-transparent bg-clip-text">
          What are you watching?
        </h1>
        <p className="text-zinc-400 text-lg sm:text-xl text-center max-w-2xl">
          Search for movies and TV shows, build your minimalist playlist, and track your cinematic journey.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <Input 
            type="text" 
            placeholder="Search for titles..." 
            className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 border-zinc-800 text-lg rounded-full shadow-2xl focus-visible:ring-1 focus-visible:ring-zinc-600 transition-all placeholder:text-zinc-600 hover:bg-zinc-900"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-2xl font-semibold tracking-tight">Trending Movies</h2>
          </div>
          <TrendingMovies />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-2xl font-semibold tracking-tight">Trending TV Shows</h2>
          </div>
          <TrendingTV />
        </section>
      </div>
    </main>
  )
}
