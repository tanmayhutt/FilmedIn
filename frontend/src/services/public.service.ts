import { fetchApi } from '@/services/api.client'

export async function getPublicProfile(username: string) {
  try {
    return await fetchApi(`/users/public/${username}`)
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
