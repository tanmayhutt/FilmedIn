import { fetchApi } from '@/services/api.client'

export async function updateAvatar(url: string) {
  try {
    await fetchApi('/users/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatarUrl: url })
    })
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function uploadCustomAvatar(formData: FormData) {
  try {
    const data = await fetchApi('/users/avatar/upload', {
      method: 'POST',
      body: formData
    })
    return { success: true, url: data.avatarUrl }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateProfile(data: { username?: string, avatarUrl?: string }) {
  try {
    const res = await fetchApi('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    return { success: true, user: res.user, token: res.token }
  } catch (err: any) {
    return { error: err.message || 'Failed to update profile' }
  }
}

export async function deleteAccount() {
  try {
    const res = await fetchApi('/users/me', {
      method: 'DELETE'
    })
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to delete account' }
  }
}

export async function toggleFollow(username: string) {
  try {
    const res = await fetchApi(`/users/${username}/follow`, {
      method: 'POST'
    })
    return { success: true, isFollowing: res.isFollowing }
  } catch (err: any) {
    return { error: err.message || 'Failed to toggle follow' }
  }
}
