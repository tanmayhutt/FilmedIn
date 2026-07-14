import { fetchTVDetails } from '@/lib/tmdb'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { AddToListButton } from '@/components/AddToListButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WallpaperGenerator } from '@/components/WallpaperGenerator'

export default async function TVDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const tv = await fetchTVDetails(params.id)
  if (!tv) return notFound()

  const backdropPath = tv.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}` 
    : '/placeholder.png'
  const posterPath = tv.poster_path 
    ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` 
    : '/placeholder.png'

  return (
    <main className="min-h-screen bg-zinc-950 pb-20">
      {/* Hero Header */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        {tv.backdrop_path && (
          <Image 
            src={backdropPath}
            alt={tv.name}
            fill
            className="object-cover opacity-30 blur-sm"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col md:flex-row gap-8 items-end max-w-7xl mx-auto">
          <div className="w-[150px] md:w-[250px] flex-shrink-0 rounded-lg overflow-hidden border border-zinc-800 shadow-2xl relative aspect-[2/3] hidden md:block">
            <Image src={posterPath} alt={tv.name} fill className="object-cover" />
          </div>
          
          <div className="flex flex-col gap-4 z-10 w-full pb-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">{tv.name}</h1>
            <div className="flex flex-wrap gap-4 text-zinc-300 text-sm md:text-base items-center">
              <span>{tv.first_air_date?.substring(0,4)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">★ {tv.vote_average?.toFixed(1)}</span>
              <span>•</span>
              <span>{tv.number_of_seasons} Seasons</span>
            </div>
            
            <div className="flex gap-4 mt-2">
              <AddToListButton tmdbId={tv.id} mediaType="tv" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 md:mt-16">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-transparent border-b border-zinc-800 rounded-none w-full justify-start h-auto p-0 flex gap-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none pb-3 px-1">Overview</TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none pb-3 px-1">Details</TabsTrigger>
            <TabsTrigger value="wallpapers" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none pb-3 px-1">Wallpapers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-8 text-zinc-300 max-w-3xl leading-relaxed text-lg">
            <p>{tv.overview}</p>
            <div className="mt-8">
              <h3 className="text-white font-medium mb-4">Top Cast</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {tv.credits?.cast?.slice(0,10).map((actor: any) => (
                  <div key={actor.id} className="flex-shrink-0 w-24 text-center">
                    <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden relative mb-2">
                      {actor.profile_path ? (
                        <Image src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">No Image</div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-white truncate">{actor.name}</div>
                    <div className="text-xs text-zinc-500 truncate">{actor.character}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="mt-8 text-zinc-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-white font-medium mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {tv.genres?.map((g: any) => (
                    <span key={g.id} className="bg-zinc-900 px-3 py-1 rounded-full text-sm">{g.name}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Networks</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  {tv.networks?.map((n: any) => (
                    n.logo_path ? (
                      <div key={n.id} className="h-8 w-16 relative bg-white rounded p-1">
                        <Image src={`https://image.tmdb.org/t/p/w200${n.logo_path}`} alt={n.name} fill className="object-contain" />
                      </div>
                    ) : (
                      <span key={n.id} className="text-sm">{n.name}</span>
                    )
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="wallpapers" className="mt-8">
            <WallpaperGenerator tmdbId={tv.id} mediaType="tv" title={tv.name} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
