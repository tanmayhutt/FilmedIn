'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAvatar(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if profile exists
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()

  if (profile) {
    // Normal update
    const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    if (error) return { error: error.message }
  } else {
    // Auto-fix ghost account
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User'
    const { error } = await supabase.from('profiles').insert({ id: user.id, username, avatar_url: url })
    if (error) return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function uploadCustomAvatar(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)

  // Use the exact same auto-fix logic
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()

  if (profile) {
    const { error } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    if (error) return { error: error.message }
  } else {
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User'
    const { error } = await supabase.from('profiles').insert({ id: user.id, username, avatar_url: publicUrl })
    if (error) return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true, url: publicUrl }
}
