import { searchMedia } from '@/lib/tmdb'
import { MediaCard } from '@/components/MediaCard'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>
}) {
  const searchParams = await props.searchParams
  const query = searchParams.q || ''
  
  let results: any[] = []
  if (query) {
    try {
      results = await searchMedia(query)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
      <div className="mb-4">
        <Link href="/" className="text-zinc-400 hover:text-zinc-200 text-sm">
          &larr; Back to Home
        </Link>
      </div>
      
      <header className="flex flex-col gap-4 max-w-xl mx-auto w-full text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 mb-2">Search Results</h1>
        <form action="/search" className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
          <Input 
            type="text" 
            name="q"
            defaultValue={query}
            placeholder="Search movies, tv shows..." 
            className="w-full pl-12 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-full h-12 focus-visible:ring-zinc-700 focus-visible:ring-offset-0"
          />
        </form>
      </header>

      {query ? (
        <section className="mt-8">
          {results.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6">
              {results.map((media) => (
                <MediaCard key={media.id} media={media} />
              ))}
            </div>
          ) : (
            <div className="text-zinc-500 py-12 text-center text-lg">No results found for "{query}".</div>
          )}
        </section>
      ) : (
        <div className="text-zinc-500 py-12 text-center text-lg mt-8">Type something to search.</div>
      )}
    </main>
  )
}
