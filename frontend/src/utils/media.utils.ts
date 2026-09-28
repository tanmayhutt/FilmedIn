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
  // Server-enriched items carry both title and name, so the explicit media type wins when present.
  const explicitType = (media as { media_type?: string; mediaType?: string }).media_type || (media as { mediaType?: string }).mediaType
  const isMovie = explicitType ? explicitType === 'movie' : 'title' in media
  const title = (isMovie ? (media as TMDBMovie).title : (media as TMDBTVShow).name) || (media as TMDBMovie).title || (media as TMDBTVShow).name
  const date = (isMovie ? (media as TMDBMovie).release_date : (media as TMDBTVShow).first_air_date) || (media as TMDBMovie).release_date || (media as TMDBTVShow).first_air_date
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
  mediaType: 'movie' | 'tv',
  itemMap: Record<string, string[]>,
  userPlaylists: { id: string; name: string }[]
): string[] {
  const key = `${mediaType}:${mediaId}`
  if (!mediaId || !itemMap || !itemMap[key] || !Array.isArray(userPlaylists)) {
    return []
  }
  const savedIds = itemMap[key] || []
  return userPlaylists
    .filter(pl => pl && pl.id && savedIds.includes(pl.id))
    .map(pl => pl.name)
}
