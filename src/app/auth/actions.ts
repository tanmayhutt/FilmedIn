'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function loginClientAction(data: { email: string, password: string }) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signupClientAction(data: { email: string, password: string, username: string }) {
  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  if (authData.user) {
    // Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username: data.username,
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }

    // Create default playlists
    const playlists = ['Watching', 'Plan to Watch', 'Watched'];
    for (const name of playlists) {
      await supabase.from('playlists').insert({
        user_id: authData.user.id,
        name: name,
        type: 'system',
      });
    }
  }

  return { success: true }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getUsernameByEmail(email: string) {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) throw error

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!user) {
      return { error: 'No account found with that email address.' }
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { error: 'Account found, but no username associated.' }
    }

    return { username: profile.username }
  } catch (error) {
    return { error: 'An error occurred while finding the username.' }
  }
}
