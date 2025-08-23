/**
 * API Hooks
 *
 * Custom React hooks for data fetching using the API client.
 * These hooks provide a simple interface for components to fetch data.
 */

import { useState, useEffect, useCallback } from 'react'
import type {
  Spot,
  Category,
  Review,
  GetSpotsParams,
  SearchParams,
  GetReviewsParams,
} from '../../api/types'
import type { Itinerary } from '@/lib/itinerary-store'
import * as spotsApi from './spots'
import * as categoriesApi from './categories'
import * as reviewsApi from './reviews'
import * as itinerariesApi from './itineraries'
import * as profileApi from './profile'

// Generic hook state interface
interface HookState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

// Generic hook for data fetching
function useApiData<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
): HookState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<HookState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  // Client-side mounting flag to prevent hydration mismatches
  const [isMounted, setIsMounted] = useState(false)

  const fetchData = useCallback(async () => {
    // Only fetch data on client side
    if (typeof window === 'undefined') return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const data = await fetchFn()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
    }
  }, deps)

  useEffect(() => {
    setIsMounted(true)
    fetchData()
  }, [fetchData])

  // Return consistent loading state during SSR/hydration
  if (!isMounted) {
    return {
      data: null,
      loading: true,
      error: null,
      refetch: fetchData,
    }
  }

  return {
    ...state,
    refetch: fetchData,
  }
}

// Spots hooks
export function useSpots(params?: GetSpotsParams) {
  return useApiData(
    () => spotsApi.getSpots(params),
    [JSON.stringify(params)]
  )
}

export function useSpot(id: string) {
  return useApiData(() => spotsApi.getSpot(id), [id])
}

export function usePopularSpots(limit?: number) {
  return useApiData(() => spotsApi.getPopularSpots(limit), [limit])
}

export function useFeaturedSpots(limit?: number) {
  return useApiData(() => spotsApi.getFeaturedSpots(limit), [limit])
}

export function useSpotsByCategory(
  categoryId: string,
  limit?: number
) {
  return useApiData(
    () => spotsApi.getSpotsByCategory(categoryId, limit),
    [categoryId, limit]
  )
}

export function useSearchSpots(params: {
  query: string
  limit?: number
}) {
  return useApiData(
    () => spotsApi.searchSpots(params),
    [JSON.stringify(params)]
  )
}

// Categories hooks
export function useCategories() {
  return useApiData(() => categoriesApi.getCategories())
}

export function useCategory(id: string) {
  return useApiData(() => categoriesApi.getCategory(id), [id])
}

// Reviews hooks
export function useReviews(params?: GetReviewsParams) {
  return useApiData(
    () => reviewsApi.getReviews(params),
    [JSON.stringify(params)]
  )
}

export function useSpotReviews(spotId: string, limit?: number) {
  return useApiData(
    () => reviewsApi.getSpotReviews(spotId, limit),
    [spotId, limit]
  )
}

// Itinerary hooks
export function useItineraries() {
  const result = useApiData(() => itinerariesApi.getItineraries())
  return {
    ...result,
    refresh: result.refetch,
  }
}

export function useItinerary(id: string) {
  const result = useApiData(
    () => itinerariesApi.getItinerary(id),
    [id]
  )
  return {
    ...result,
    refresh: result.refetch,
  }
}

// Health check hook
export function useHealthCheck() {
  return useApiData(() => {
    return fetch('http://localhost:3001/api/health')
      .then((res) => res.json())
      .catch(() => ({
        status: 'ERROR',
        message: 'API server is not running',
      }))
  })
}

// Profile hooks
export function useProfile() {
  return useApiData(() => profileApi.getProfile())
}

export function useUpdateProfile() {
  // Expose a helper that updates then refetches
  const [state, setState] = useState<{
    loading: boolean
    error: Error | null
  }>({ loading: false, error: null })
  const update = async (data: Partial<profileApi.UserProfile>) => {
    setState({ loading: true, error: null })
    try {
      const result = await profileApi.updateProfile(data)
      setState({ loading: false, error: null })
      return result
    } catch (e) {
      setState({ loading: false, error: e as Error })
      throw e
    }
  }
  return { ...state, update }
}
