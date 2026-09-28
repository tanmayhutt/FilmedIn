import { fetchApi } from '@/services/api.client'

export async function getPublicProfile(username: string) {
  try {
    return await fetchApi(`/users/public/${encodeURIComponent(username)}`)
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function getPublicPlaylists(userId: string) {
  try {
    return await fetchApi(`/playlists/public/user/${userId}`)
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function searchUsers(query: string) {
  try {
    return await fetchApi(`/users/search?q=${encodeURIComponent(query)}`)
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function getFollowers(username: string) {
  try {
    return await fetchApi(`/users/${encodeURIComponent(username)}/followers`)
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function getFollowing(username: string) {
  try {
    return await fetchApi(`/users/${encodeURIComponent(username)}/following`)
  } catch (err) {
    console.error(err)
    return []
  }
}
