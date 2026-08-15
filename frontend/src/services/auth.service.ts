import { fetchApi } from '@/services/api.client'
import { clearSessionHint, markSessionActive } from '@/utils/auth'

export async function googleLoginAction(credential: string) {
  try {
    const res = await fetchApi('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential })
    })
    
    markSessionActive()
    return { success: true, user: res.user, isNewUser: res.isNewUser }
  } catch (err: any) {
    return { error: err.message }
  }
}



export async function signout() {
  try {
    await fetchApi('/auth/logout', { method: 'POST' })
  } finally {
    clearSessionHint()
  }
  return { success: true }
}
