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
}

// Convert Supabase profile to app profile format
function convertFromSupabase(supabaseProfile: Tables<'profiles'>): UserProfile {
  return {
    name: supabaseProfile.name,
    city: supabaseProfile.city,
    website: supabaseProfile.website || undefined,
    about: supabaseProfile.about,
    joinedYear: supabaseProfile.joined_year,
    contributions: supabaseProfile.contributions,
    avatarUrl: supabaseProfile.avatar_url || undefined,
  }
}

// Convert app profile to Supabase format
function convertToSupabase(profile: Partial<UserProfile>): any {
  return {
    ...(profile.name !== undefined && { name: profile.name }),
    ...(profile.city !== undefined && { city: profile.city }),
    ...(profile.website !== undefined && { website: profile.website }),
    ...(profile.about !== undefined && { about: profile.about }),
    ...(profile.joinedYear !== undefined && { joined_year: profile.joinedYear }),
    ...(profile.contributions !== undefined && { contributions: profile.contributions }),
    ...(profile.avatarUrl !== undefined && { avatar_url: profile.avatarUrl }),
  }
}

// Use the demo user ID that matches the one we'll create
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function getProfile(): Promise<UserProfile> {
  try {
    const supabaseProfile = await profilesApi.getById(DEMO_USER_ID)
    return convertFromSupabase(supabaseProfile)
  } catch (error) {
    // If profile doesn't exist, return the default profile from db.json
    if (error instanceof Error && error.message.includes('No rows found')) {
      return {
        name: "Jowehl",
        city: "Ambago, Agusan del Norte, Philippines",
        website: "jotjot.com",
        about: "I'm a traveler at heart who loves exploring new places, discovering hidden gems, and creating memorable adventures wherever I go.",
        joinedYear: 2025,
        contributions: 0,
        avatarUrl: "/uploads/avatar_1755665481.jpg",
      }
    }
    throw error
  }
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const supabaseData = convertToSupabase(data)
  
  try {
    const supabaseProfile = await profilesApi.update(DEMO_USER_ID, supabaseData)
    return convertFromSupabase(supabaseProfile)
  } catch (error) {
    // If profile doesn't exist, create it
    if (error instanceof Error && error.message.includes('No rows found')) {
      const { supabase } = await import('@/lib/supabase/config')
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: DEMO_USER_ID,
          name: data.name || 'Jowehl',
          city: data.city || 'Ambago, Agusan del Norte, Philippines',
          website: data.website || null,
          about: data.about || 'I\'m a traveler at heart who loves exploring new places, discovering hidden gems, and creating memorable adventures wherever I go.',
          joined_year: data.joinedYear || 2025,
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
  // For now, return a placeholder URL
  // You can implement Supabase Storage upload here later
  return '/placeholder-user.jpg'
}


