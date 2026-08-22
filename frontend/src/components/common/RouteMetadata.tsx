import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = 'FilmedIn'
const SITE_URL = 'https://filmedin.tanmaytiwari.me'
const DEFAULT_DESCRIPTION = 'Track movies and TV shows, build playlists, compare taste with friends, and discover what to watch next.'

type RouteMeta = {
  title: string
  description: string
  noIndex?: boolean
}

function getRouteMeta(pathname: string): RouteMeta {
  if (pathname === '/') return { title: `${SITE_NAME} | Your cinematic identity`, description: DEFAULT_DESCRIPTION }
  if (pathname === '/about') return { title: `About | ${SITE_NAME}`, description: 'Learn how FilmedIn helps film and TV fans track, discover, and share what they watch.' }
  if (pathname === '/studios') return { title: `Studios and networks | ${SITE_NAME}`, description: 'Browse movies and TV shows from major studios and networks.' }
  if (pathname === '/explore') return { title: `Explore movies and TV | ${SITE_NAME}`, description: 'Explore popular movies, TV shows, genres, studios, and networks.' }
  if (pathname === '/search') return { title: `Search | ${SITE_NAME}`, description: 'Search for movies, TV shows, and FilmedIn members.' }
  if (pathname === '/privacy') return { title: `Privacy policy | ${SITE_NAME}`, description: 'How FilmedIn collects, uses, and deletes account data.' }
  if (pathname === '/terms') return { title: `Terms of service | ${SITE_NAME}`, description: 'The terms that apply when using FilmedIn.' }
  if (pathname === '/login') return { title: `Sign in | ${SITE_NAME}`, description: 'Sign in to manage playlists, follow friends, and compare your taste.', noIndex: true }
  if (pathname === '/onboarding') return { title: `Set up your profile | ${SITE_NAME}`, description: 'Choose your FilmedIn username and complete your profile.', noIndex: true }
  if (pathname === '/profile') return { title: `Your profile | ${SITE_NAME}`, description: 'Manage your FilmedIn profile, playlists, and social connections.', noIndex: true }
  if (pathname.startsWith('/movie/')) return { title: `Movie details | ${SITE_NAME}`, description: 'View movie details, cast, ratings, and save it to a FilmedIn playlist.' }
  if (pathname.startsWith('/tv/')) return { title: `TV show details | ${SITE_NAME}`, description: 'View TV show details, cast, seasons, episode ratings, and playlists.' }
  if (pathname.startsWith('/person/')) return { title: `Cast and filmography | ${SITE_NAME}`, description: 'Explore a cast member’s movie and TV credits.' }
  if (pathname.startsWith('/studio/')) return { title: `Studio titles | ${SITE_NAME}`, description: 'Browse movies and TV shows from this studio or network.' }
  if (pathname.startsWith('/u/')) return { title: `Member profile | ${SITE_NAME}`, description: 'View a FilmedIn member profile and public watchlists.', noIndex: true }
  if (pathname.startsWith('/playlist/') || pathname.startsWith('/profile/playlist/')) return { title: `Playlist | ${SITE_NAME}`, description: 'View a curated movie and TV playlist on FilmedIn.', noIndex: true }
  if (pathname.startsWith('/blend/')) return { title: `Taste blend | ${SITE_NAME}`, description: 'Compare two FilmedIn profiles and find titles to watch together.', noIndex: true }
  return { title: `Page not found | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, noIndex: true }
}

function setMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(property ? 'property' : 'name', name)
    document.head.appendChild(element)
  }
  element.content = content
}

export function RouteMetadata() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    const meta = getRouteMeta(pathname)
    const canonical = `${SITE_URL}${pathname}`
    document.title = meta.title
    setMeta('description', meta.description)
    setMeta('robots', meta.noIndex ? 'noindex, nofollow' : 'index, follow')
    setMeta('og:title', meta.title, true)
    setMeta('og:description', meta.description, true)
    setMeta('og:url', canonical, true)
    setMeta('twitter:title', meta.title)
    setMeta('twitter:description', meta.description)
    setMeta('og:image', `${SITE_URL}/social-preview.png`, true)
    setMeta('twitter:image', `${SITE_URL}/social-preview.png`)

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.rel = 'canonical'
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.href = canonical
  }, [pathname, search])

  return null
}

export function usePageMetadata(title: string | undefined, description?: string, image?: string) {
  useEffect(() => {
    if (!title) return
    const fullTitle = `${title} | ${SITE_NAME}`
    document.title = fullTitle
    setMeta('og:title', fullTitle, true)
    setMeta('twitter:title', fullTitle)
    if (description) {
      setMeta('description', description)
      setMeta('og:description', description, true)
      setMeta('twitter:description', description)
    }
    if (image) {
      setMeta('og:image', image, true)
      setMeta('twitter:image', image)
    }
  }, [title, description, image])
}
