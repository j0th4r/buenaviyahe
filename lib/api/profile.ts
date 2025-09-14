import { profilesApi } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/client'

export type UserProfile = {
  name: string
  city: string
  website?: string
  about?: string
  joinedYear: number
  contributions: number
  avatarUrl?: string
  role?: string
}

// Convert Supabase profile to app profile format
function convertFromSupabase(
  supabaseProfile: Tables<'profiles'>
): UserProfile {
  return {
    name: supabaseProfile.name,
    city: supabaseProfile.city,
    website: supabaseProfile.website || undefined,
    about: supabaseProfile.about,
    joinedYear: supabaseProfile.joined_year,
    contributions: supabaseProfile.contributions,
    avatarUrl: supabaseProfile.avatar_url || undefined,
    role: supabaseProfile.role,
  }
}

// Convert app profile to Supabase format
function convertToSupabase(profile: Partial<UserProfile>): any {
  return {
    ...(profile.name !== undefined && { name: profile.name }),
    ...(profile.city !== undefined && { city: profile.city }),
    ...(profile.website !== undefined && {
      website: profile.website,
    }),
    ...(profile.about !== undefined && { about: profile.about }),
    ...(profile.joinedYear !== undefined && {
      joined_year: profile.joinedYear,
    }),
    ...(profile.contributions !== undefined && {
      contributions: profile.contributions,
    }),
    ...(profile.avatarUrl !== undefined && {
      avatar_url: profile.avatarUrl,
    }),
  }
}

export async function getProfile(): Promise<UserProfile> {
  try {
    const { supabase } = await import('@/lib/supabase/config')
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const supabaseProfile = await profilesApi.getById(user.id)
    return convertFromSupabase(supabaseProfile)
  } catch (error) {
    // If profile doesn't exist, return a default profile structure
    if (
      error instanceof Error &&
      error.message.includes('No rows found')
    ) {
      return {
        name: 'New User',
        city: '',
        website: '',
        about: '',
        joinedYear: new Date().getFullYear(),
        contributions: 0,
        avatarUrl: '/uploads/avatar_1755665481.jpg',
      }
    }
    throw error
  }
}

/**
 * Get the current user's role from their profile
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const { supabase } = await import('@/lib/supabase/config')
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      return null
    }

    return profile?.role || null
  } catch (error) {
    console.error('Error fetching user role:', error)
    return null
  }
}

export async function updateProfile(
  data: Partial<UserProfile>
): Promise<UserProfile> {
  const supabaseData = convertToSupabase(data)

  try {
    const { supabase } = await import('@/lib/supabase/config')
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const supabaseProfile = await profilesApi.update(
      user.id,
      supabaseData
    )
    return convertFromSupabase(supabaseProfile)
  } catch (error) {
    // If profile doesn't exist, create it
    if (
      error instanceof Error &&
      error.message.includes('No rows found')
    ) {
      const { supabase } = await import('@/lib/supabase/config')
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: data.name || 'New User',
          city: data.city || '',
          website: data.website || null,
          about: data.about || '',
          joined_year: data.joinedYear || new Date().getFullYear(),
          contributions: data.contributions || 0,
          avatar_url: data.avatarUrl || null,
        })
        .select()
        .single()

      if (createError) throw createError
      return convertFromSupabase(newProfile)
    }
    throw error
  }
}

export async function uploadAvatar(file: File): Promise<string> {
  try {
    const { supabase } = await import('@/lib/supabase/config')
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Create unique filename with user ID and timestamp
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      })

    if (error) {
      throw error
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw new Error('Failed to upload avatar')
  }
}

export async function deleteAvatar(avatarUrl: string): Promise<void> {
  try {
    const { supabase } = await import('@/lib/supabase/config')

    // Extract filename from URL
    const urlParts = avatarUrl.split('/')
    const fileName = urlParts.slice(-2).join('/') // Get userId/filename.ext

    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName])

    if (error) {
      console.error('Error deleting avatar:', error)
    }
  } catch (error) {
    console.error('Error deleting avatar:', error)
  }
}

export async function updateProfileWithAvatar(
  data: Partial<UserProfile>,
  avatarFile?: File
): Promise<UserProfile> {
  try {
    let avatarUrl = data.avatarUrl

    // Upload new avatar if provided
    if (avatarFile) {
      avatarUrl = await uploadAvatar(avatarFile)

      // Delete old avatar if it exists and is not a placeholder
      if (
        data.avatarUrl &&
        data.avatarUrl !== '/placeholder-user.jpg' &&
        data.avatarUrl.includes('supabase')
      ) {
        await deleteAvatar(data.avatarUrl)
      }
    }

    // Update profile with new avatar URL
    return await updateProfile({
      ...data,
      avatarUrl,
    })
  } catch (error) {
    console.error('Error updating profile with avatar:', error)
    throw error
  }
}

export function validateAvatarFile(file: File): {
  valid: boolean
  error?: string
} {
  // Check file size (limit to 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed',
    }
  }

  return { valid: true }
}
