import { createServerClient } from '@/lib/supabase/config'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createServerClient()

  // Sign out the user
  await supabase.auth.signOut()

  // Redirect to home page
  redirect('/')
}
