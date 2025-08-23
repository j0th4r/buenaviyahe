/**
 * API Configuration
 *
 * Central configuration for API endpoints and settings.
 */

// API Base URL - can be overridden via environment variable

// API Endpoints
export const API_ENDPOINTS = {
  // Health
  health: '/api/health',

  // Spots
  spots: '/api/spots',
  spot: (id: string) => `/api/spots/${id}`,
  spotsPopular: '/api/spots/popular',
  spotsFeatured: '/api/spots/featured',

  // Categories
  categories: '/api/categories',
  category: (id: string) => `/api/categories/${id}`,
  categorySpots: (id: string) => `/api/categories/${id}/spots`,

  // Reviews
  reviews: '/api/reviews',
  spotReviews: (spotId: string) => `/api/spots/${spotId}/reviews`,

  // Search
  search: '/api/search',

  // Profile
  profile: '/api/profile',
  profileAvatar: '/api/profile/avatar',
} as const

// Request Configuration
export const REQUEST_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
} as const

// Cache Configuration (for React Query)
export const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
} as const

// Query Keys for React Query
export const QUERY_KEYS = {
  spots: ['spots'] as const,
  spot: (id: string) => ['spots', id] as const,
  spotsPopular: ['spots', 'popular'] as const,
  spotsFeatured: ['spots', 'featured'] as const,
  spotsCategory: (category: string) =>
    ['spots', 'category', category] as const,

  categories: ['categories'] as const,
  category: (id: string) => ['categories', id] as const,

  reviews: ['reviews'] as const,
  spotReviews: (spotId: string) =>
    ['reviews', 'spot', spotId] as const,

  search: (query: string) => ['search', query] as const,
} as const
