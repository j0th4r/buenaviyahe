/**
 * Spots API Slice
 * 
 * API functions for managing travel spots data.
 */

import { spotsApi } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/client'

export type Spot = Tables<'spots'>

// Maintain compatibility with existing hooks
export async function getSpots(params?: any): Promise<Spot[]> {
  return spotsApi.getAll()
}

export async function getSpot(id: string): Promise<Spot> {
  return spotsApi.getById(id)
}

export async function getPopularSpots(limit?: number): Promise<Spot[]> {
  const spots = await spotsApi.getPopular()
  return limit ? spots.slice(0, limit) : spots
}

export async function getFeaturedSpots(limit?: number): Promise<Spot[]> {
  const spots = await spotsApi.getFeatured()
  return limit ? spots.slice(0, limit) : spots
}

export async function getSpotsByCategory(categoryId: string, limit?: number): Promise<Spot[]> {
  // For now, filter spots by category tag
  const allSpots = await spotsApi.getAll()
  const filteredSpots = allSpots.filter(spot => 
    spot.tags && spot.tags.includes(categoryId)
  )
  return limit ? filteredSpots.slice(0, limit) : filteredSpots
}

export async function searchSpots(params: { query: string; limit?: number }): Promise<Spot[]> {
  const spots = await spotsApi.search(params.query)
  return params.limit ? spots.slice(0, params.limit) : spots
}

// Keep the service object for backward compatibility
export const spotsService = {
  async getAll(): Promise<Spot[]> {
    return spotsApi.getAll()
  },

  async getById(id: string): Promise<Spot> {
    return spotsApi.getById(id)
  },

  async getBySlug(slug: string): Promise<Spot> {
    return spotsApi.getBySlug(slug)
  },

  async getPopular(): Promise<Spot[]> {
    return spotsApi.getPopular()
  },

  async getFeatured(): Promise<Spot[]> {
    return spotsApi.getFeatured()
  },

  async search(query: string): Promise<Spot[]> {
    return spotsApi.search(query)
  }
}
