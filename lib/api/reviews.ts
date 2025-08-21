/**
 * Reviews API Slice
 * 
 * API functions for managing spot reviews and ratings.
 */

import { reviewsApi } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/client'

export type Review = Tables<'reviews'>

export interface GetReviewsParams {
  spotId?: string
  limit?: number
}

/**
 * Get all reviews with optional filtering
 */
export async function getReviews(params?: GetReviewsParams): Promise<Review[]> {
  if (params?.spotId) {
    const reviews = await reviewsApi.getBySpotId(params.spotId)
    return params.limit ? reviews.slice(0, params.limit) : reviews
  }
  
  // For now, return empty array since we don't have a getAll method
  // You can add this to the Supabase client if needed
  return []
}

/**
 * Get reviews for a specific spot
 */
export async function getSpotReviews(spotId: string, limit?: number): Promise<Review[]> {
  const reviews = await reviewsApi.getBySpotId(spotId)
  return limit ? reviews.slice(0, limit) : reviews
}






