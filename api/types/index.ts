// Shared API types between frontend and mock API server

export type ApiResponse<T = any> = {
  success: boolean
  data: T
  count?: number
  message?: string
  error?: string
  [key: string]: any
}

export type ApiError = {
  success: false
  error: string
  message?: string
}

// Domain types
export type SpotPricing = {
  oneNight: string
  twoNights: string
  pricePerNight: number
}

export type Spot = {
  id: string
  title: string
  slug: string
  location: string
  description: string
  tags: string[]
  images: string[]
  rating: number
  reviews: number
  pricing: SpotPricing
  amenities: string[]
  createdAt?: string
  updatedAt?: string
  lat?: number
  lng?: number
}

export type Category = {
  id: string
  name: string
  description: string
  image: string
  priceRange: string
}

export type Review = {
  id: string
  spotId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: string
}

// Request param types
export type GetSpotsParams = {
  category?: string
  popular?: boolean
  featured?: boolean
  limit?: number
}

export type GetReviewsParams = {
  spotId?: string
  limit?: number
}

export type SearchParams = {
  q: string
  category?: string
  limit?: number
}

// Response specializations
export type SpotsResponse = ApiResponse<Spot[]>
export type SpotResponse = ApiResponse<Spot>
export type CategoriesResponse = ApiResponse<Category[]>
export type CategoryResponse = ApiResponse<Category>
export type ReviewsResponse = ApiResponse<Review[]>
export type SearchResponse = ApiResponse<Spot[]>
