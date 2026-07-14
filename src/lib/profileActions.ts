import { supabase } from './supabase'

export async function updateAvatar(url: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()

  if (profile) {
    const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    if (error) return { error: error.message }
  } else {
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User'
    const { error } = await supabase.from('profiles').insert({ id: user.id, username, avatar_url: url })
    if (error) return { error: error.message }
  }

  return { success: true }
}

export async function uploadCustomAvatar(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file)
  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()

  if (profile) {
    const { error } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    if (error) return { error: error.message }
  } else {
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User'
    const { error } = await supabase.from('profiles').insert({ id: user.id, username, avatar_url: publicUrl })
    if (error) return { error: error.message }
  }

  return { success: true, url: publicUrl }
}
