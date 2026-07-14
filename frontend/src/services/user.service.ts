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
