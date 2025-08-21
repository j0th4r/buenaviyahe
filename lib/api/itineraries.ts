import { itinerariesApi } from '@/lib/supabase/client'
import { supabase } from '@/lib/supabase/config'
import type { Tables } from '@/lib/supabase/client'
import type { Itinerary } from '@/lib/itinerary-store'

export type SupabaseItinerary = Tables<'itineraries'>

export interface CreateItineraryData {
  title?: string
  start?: string
  end?: string
  days?: Record<number, any[]>
}

export interface UpdateItineraryData extends Partial<CreateItineraryData> {}

// Convert Supabase itinerary to app itinerary format
function convertFromSupabase(supabaseItinerary: SupabaseItinerary): Itinerary {
  return {
    id: supabaseItinerary.id,
    title: supabaseItinerary.title,
    start: supabaseItinerary.start_date,
    end: supabaseItinerary.end_date,
    days: supabaseItinerary.days as Record<number, any[]>,
  }
}

// Convert app itinerary to Supabase format
function convertToSupabase(itinerary: CreateItineraryData, userId?: string): any {
  return {
    title: itinerary.title,
    start_date: itinerary.start,
    end_date: itinerary.end,
    days: itinerary.days || {},
    user_id: userId,
  }
}

// Get all itineraries for the current user
export async function getItineraries(userId?: string): Promise<Itinerary[]> {
  try {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('No user authenticated, returning empty itineraries')
        return []
      }
      userId = user.id
    }

    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data.map(convertFromSupabase)
  } catch (error) {
    console.warn('Failed to fetch itineraries from Supabase:', error)
    return []
  }
}

// Get a specific itinerary by ID
export async function getItinerary(id: string): Promise<Itinerary | null> {
  try {
    const supabaseItinerary = await itinerariesApi.getById(id)
    return convertFromSupabase(supabaseItinerary)
  } catch (error) {
    if (error instanceof Error && error.message.includes('No rows found')) {
      return null
    }
    throw error
  }
}

// Create a new itinerary
export async function createItinerary(data: CreateItineraryData, userId?: string): Promise<Itinerary> {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated to create an itinerary')
    userId = user.id
  }

  const supabaseData = convertToSupabase(data, userId)
  const supabaseItinerary = await itinerariesApi.create(supabaseData)
  return convertFromSupabase(supabaseItinerary)
}

// Update an existing itinerary
export async function updateItinerary(id: string, data: UpdateItineraryData): Promise<Itinerary> {
  const supabaseData = {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.start !== undefined && { start_date: data.start }),
    ...(data.end !== undefined && { end_date: data.end }),
    ...(data.days !== undefined && { days: data.days }),
  }
  
  const supabaseItinerary = await itinerariesApi.update(id, supabaseData)
  return convertFromSupabase(supabaseItinerary)
}

// Delete an itinerary
export async function deleteItinerary(id: string): Promise<{ message: string }> {
  await itinerariesApi.delete(id)
  return { message: 'Itinerary deleted successfully' }
}