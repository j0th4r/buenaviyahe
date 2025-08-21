/**
 * API Module Index
 * 
 * Centralized exports for the Travel Home API module.
 * This file provides a single entry point for all API-related functionality.
 */

// Client and configuration
export { apiClient, ApiClient, ApiClientError, buildUrl } from './client'
export { API_ENDPOINTS, REQUEST_CONFIG, CACHE_CONFIG, QUERY_KEYS } from './config'

// API functions
export * from './spots'
// Avoid name clash with spots.getCategory helper
export { getCategories, getCategory as getCategoryById } from './categories'
export * from './reviews'
export * from './itineraries'
export { getProfile as getUserProfile, updateProfile as updateUserProfile, uploadAvatar } from './profile'
export type { UserProfile } from './profile'

// Hooks
export * from './hooks'

// Types (re-exported for convenience)
export type {
  Spot,
  Category,
  Review,
  SpotPricing,
  ApiResponse,
  ApiError,
  GetSpotsParams,
  GetReviewsParams,
  SearchParams,
  SpotsResponse,
  SpotResponse,
  CategoriesResponse,
  CategoryResponse,
  ReviewsResponse,
  SearchResponse,
} from '../../api/types/index'

