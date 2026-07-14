import { Link } from 'react-router-dom'
import { TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'

export function MediaCard({ media, disableLink = false }: { media: TMDBMovie | TMDBTVShow, disableLink?: boolean }) {
  const isMovie = 'title' in media
  const title = isMovie ? media.title : media.name
  const date = isMovie ? media.release_date : media.first_air_date
  const year = date ? new Date(date).getFullYear() : 'N/A'
  
  const href = `/${isMovie ? 'movie' : 'tv'}/${media.id}`

  const CardContent = (
    <div className="w-[160px] sm:w-[200px] group relative flex flex-col gap-2 shrink-0">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800/50 transition-colors group-hover:border-zinc-700">
        {media.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
            alt={title}
            loading="lazy"
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs text-center p-4">
            No Image Available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="flex flex-col">
        <h3 className="font-semibold text-sm sm:text-base text-zinc-100 line-clamp-1 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-xs sm:text-sm text-zinc-500">{year} • {isMovie ? 'Movie' : 'TV Show'}</p>
      </div>
    </div>
  )

  if (disableLink) {
    return CardContent
  }

  return (
    <Link to={href} className="outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 rounded-lg">
      {CardContent}
    </Link>
  )
}
