/**
 * Categories API Slice
 * 
 * API functions for managing travel spot categories.
 */

import { categoriesApi } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/client'

export type Category = Tables<'categories'>

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  return categoriesApi.getAll()
}

/**
 * Get a specific category by ID
 */
export async function getCategory(id: string): Promise<Category | null> {
  try {
    return await categoriesApi.getById(id)
  } catch (error) {
    // Return null for 404 errors, re-throw others
    if (error instanceof Error && error.message.includes('No rows found')) {
      return null
    }
    throw error
  }
}






