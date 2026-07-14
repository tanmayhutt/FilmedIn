import Image from "next/image"
import Link from "next/link"
import { TMDBMovie, TMDBTVShow } from "@/lib/tmdb"

interface MediaCardProps {
  media: TMDBMovie | TMDBTVShow;
}

export function MediaCard({ media }: MediaCardProps) {
  const isMovie = 'title' in media;
  const title = isMovie ? (media as TMDBMovie).title : (media as TMDBTVShow).name;
  const posterPath = media.poster_path 
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}` 
    : '/placeholder.png'; 
  const href = isMovie ? `/movie/${media.id}` : `/tv/${media.id}`;

  return (
    <Link href={href} className="group relative w-[150px] md:w-[200px] flex-shrink-0 cursor-pointer overflow-hidden rounded-lg block">
      <div className="aspect-[2/3] w-full relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {media.poster_path ? (
          <Image 
            src={posterPath} 
            alt={title || "Media Poster"} 
            fill 
            className="object-cover transition-transform duration-300 group-hover:scale-105" 
            sizes="(max-width: 768px) 150px, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs text-center p-2">
            No Image
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
        <h3 className="text-zinc-50 font-medium text-sm line-clamp-2">{title}</h3>
      </div>
    </Link>
  )
}
