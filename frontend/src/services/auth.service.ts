import { fetchApi } from '@/services/api.client'

export async function googleLoginAction(credential: string) {
  try {
    const res = await fetchApi('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential })
    })
    
    if (res.token) {
      localStorage.setItem('token', res.token)
    }
    return { success: true, user: res.user }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function signout() {
  localStorage.removeItem('token')
  return { success: true }
}
