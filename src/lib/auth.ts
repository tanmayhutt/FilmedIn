import { supabase } from './supabase'

export async function loginWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return { success: true }
}

export async function signupClientAction(data: { email: string, password: string, username: string }) {
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { username: data.username }
    }
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function loginWithOtpClientAction(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function verifyOtpClientAction(email: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePasswordClientAction(password: string) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  return { success: true }
}

export async function signout() {
  await supabase.auth.signOut()
}
