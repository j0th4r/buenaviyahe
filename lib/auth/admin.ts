import { createServerClient } from '@/lib/supabase/config'
import { redirect } from 'next/navigation'

export type UserRole = 'user' | 'admin' | 'business_owner'

export interface AdminUser {
  id: string
  email: string
  role: UserRole
  profile: {
    name: string
    avatar_url?: string
  }
}

/**
 * Server-side admin authentication check
 * Redirects to login if not authenticated or not an admin/business owner
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    redirect('/auth/login?redirect=/admin')
  }

  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Profile error:', profileError)
    redirect('/auth/login?redirect=/admin')
  }

  if (!profile) {
    redirect('/auth/login?redirect=/admin')
  }

  // Check if user has admin or business owner role
  if (profile.role !== 'admin' && profile.role !== 'business_owner') {
    console.log(
      'User does not have admin privileges, role:',
      profile.role
    )
    redirect('/?error=unauthorized')
  }

  console.log('Admin access granted for:', profile.name)

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    profile: {
      name: profile.name,
      avatar_url: profile.avatar_url,
    },
  }
}

/**
 * Get current user role (server-side)
 */
export async function getUserRole(
  userId: string
): Promise<UserRole | null> {
  const supabase = await createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return (profile?.role as UserRole) || null
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'admin'
}

/**
 * Check if user has business owner privileges
 */
export function isBusinessOwner(role: UserRole): boolean {
  return role === 'business_owner' || role === 'admin'
}

/**
 * Server-side business owner authentication check
 * Redirects to login if not authenticated or not a business owner
 */
export async function requireBusinessOwner(): Promise<AdminUser> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    redirect('/auth/login?redirect=/business')
  }

  if (!user) {
    redirect('/auth/login?redirect=/business')
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Profile error:', profileError)
    redirect('/auth/login?redirect=/business')
  }

  if (!profile) {
    redirect('/auth/login?redirect=/business')
  }

  // Check if user has business owner role (business owners and admins can access)
  if (!isBusinessOwner(profile.role as UserRole)) {
    console.log(
      'User does not have business owner privileges, role:',
      profile.role
    )
    redirect('/?error=unauthorized')
  }

  console.log('Business owner access granted for:', profile.name)

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    profile: {
      name: profile.name,
      avatar_url: profile.avatar_url,
    },
  }
}
