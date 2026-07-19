import { fetchApi } from '@/services/api.client'

export async function loginWithPassword(email: string, password: string) {
  try {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    if (res.requireOtp) {
      return { success: true, requireOtp: true, email: res.email }
    }
    
    // Fallback if no OTP required (though the new flow always requires it)
    if (res.token) {
      localStorage.setItem('token', res.token)
    }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function verifyLoginOtpAction(email: string, otp: string) {
  try {
    const res = await fetchApi('/auth/verify-login-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    })
    localStorage.setItem('token', res.token)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function signupClientAction(data: { email: string, password: string, username: string }) {
  try {
    const res = await fetchApi('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    if (res.requireOtp) {
      return { success: true, requireOtp: true, email: res.email }
    }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function loginWithOtpClientAction(email: string) {
  try {
    const res = await fetchApi('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
    return { success: true, username: res.username }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function verifyOtpClientAction(email: string, token: string) {
  try {
    const res = await fetchApi('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp: token })
    })
    localStorage.setItem('token', res.token) // Temporary reset token
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updatePasswordClientAction(password: string) {
  try {
    await fetchApi('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password })
    })
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function signout() {
  localStorage.removeItem('token')
  return { success: true }
}
