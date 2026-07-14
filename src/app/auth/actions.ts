'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/profile')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string || email.split('@')[0];

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect('/signup?message=Could not create user')
  }

  if (data.user) {
    // Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      username: username,
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }

    // Create default playlists
    const playlists = ['Watching', 'Plan to Watch', 'Watched'];
    for (const name of playlists) {
      await supabase.from('playlists').insert({
        user_id: data.user.id,
        name: name,
        type: 'system',
      });
    }
  }

  revalidatePath('/', 'layout')
  redirect('/profile')
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
