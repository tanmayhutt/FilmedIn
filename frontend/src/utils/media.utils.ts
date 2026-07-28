import { TMDBMovie, TMDBTVShow } from '@/services/tmdb.service'

export interface FormattedMediaDetails {
  isMovie: boolean
  title: string
  date: string | undefined
  year: string | number
  isUnreleased: boolean
  rating: number
  mediaType: 'movie' | 'tv'
  href: string
}

export function parseMediaDetails(media: TMDBMovie | TMDBTVShow): FormattedMediaDetails {
  const isMovie = 'title' in media
  const title = isMovie ? media.title : media.name
  const date = isMovie ? media.release_date : media.first_air_date
  const year = date ? new Date(date).getFullYear() : 'N/A'
  const isUnreleased = date ? new Date(date).getTime() > Date.now() : false
  const rating = isUnreleased ? 0 : (media.vote_average ?? 0)
  const mediaType: 'movie' | 'tv' = isMovie ? 'movie' : 'tv'
  const href = `/${mediaType}/${media?.id}`

  return {
    isMovie,
    title,
    date,
    year,
    isUnreleased,
    rating,
    mediaType,
    href,
  }
}

export function getSavedPlaylistNames(
  mediaId: number | undefined,
  itemMap: Record<number, string[]>,
  userPlaylists: { id: string; name: string }[]
): string[] {
  if (!mediaId || !itemMap || !itemMap[mediaId] || !Array.isArray(userPlaylists)) {
    return []
  }
  const savedIds = itemMap[mediaId] || []
  return userPlaylists
    .filter(pl => pl && pl.id && savedIds.includes(pl.id))
    .map(pl => pl.name)
}
