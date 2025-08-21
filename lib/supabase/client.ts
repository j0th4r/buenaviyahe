import { supabase } from './config'
import type { Database } from '../../types/supabase'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Spots API
export const spotsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) throw error
    return data
  },

  async getPopular() {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .contains('tags', ['popular'])
      .order('rating', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getFeatured() {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .contains('tags', ['featured'])
      .order('rating', { ascending: false })
    
    if (error) throw error
    return data
  },

  async search(query: string) {
    const trimmed = (query || '').trim()
    if (!trimmed) return []

    // Sanitize characters that can break the OR filter string
    const safe = trimmed.replace(/[(),]/g, ' ')

    const { data, error } = await supabase
      .from('spots')
      .select('*')
      // PostgREST uses * as wildcard in filter strings
      .or(`title.ilike.*${safe}*,description.ilike.*${safe}*,location.ilike.*${safe}*`)
      .order('rating', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Categories API
export const categoriesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// Itineraries API
export const itinerariesApi = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(itinerary: Inserts<'itineraries'>) {
    const { data, error } = await supabase
      .from('itineraries')
      .insert(itinerary)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Updates<'itineraries'>) {
    const { data, error } = await supabase
      .from('itineraries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Reviews API
export const reviewsApi = {
  async getBySpotId(spotId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('spot_id', spotId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(review: Inserts<'reviews'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Profiles API
export const profilesApi = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Updates<'profiles'>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
