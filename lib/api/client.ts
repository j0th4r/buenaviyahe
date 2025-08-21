/**
 * API Client
 * 
 * Low-level API client with error handling, retries, and request/response interceptors.
 */

import { API_BASE_URL, REQUEST_CONFIG } from './config'
import type { ApiResponse, ApiError } from '../../api/types/index'

// Custom error class for API errors
export class ApiClientError extends Error {
  public status: number
  public response?: ApiError

  constructor(message: string, status: number, response?: ApiError) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.response = response
  }
}

// Request options interface
export interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

// Utility function to create delays for retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Utility function to build URL with query parameters
export function buildUrl(endpoint: string, params?: Record<string, any>): string {
  const url = new URL(endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value))
      }
    })
  }
  
  return url.toString()
}

// Core API client class
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Make an HTTP request with error handling and retries
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = REQUEST_CONFIG.timeout,
      retries = REQUEST_CONFIG.retries,
      retryDelay = REQUEST_CONFIG.retryDelay,
      ...fetchOptions
    } = options

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`

    // Determine if we're sending multipart form data
    const isFormData = typeof FormData !== 'undefined' && (fetchOptions.body as any) instanceof FormData

    // Set default headers
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(fetchOptions.headers as Record<string, string> | undefined),
    }
    // Only set JSON content type when NOT sending FormData
    if (!isFormData && !('Content-Type' in headers)) {
      headers['Content-Type'] = 'application/json'
    }

    let lastError: Error | null = null

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create AbortController for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Parse response
        let data: ApiResponse<T>
        try {
          data = await response.json()
        } catch (parseError) {
          throw new ApiClientError(
            'Failed to parse response as JSON',
            response.status
          )
        }

        // Handle HTTP errors
        if (!response.ok) {
          const errorMessage = data.message || data.error || `HTTP ${response.status}`
          throw new ApiClientError(
            errorMessage,
            response.status,
            data as ApiError
          )
        }

        return data
      } catch (error) {
        lastError = error as Error

        // Don't retry on certain errors
        if (
          error instanceof ApiClientError && 
          (error.status >= 400 && error.status < 500)
        ) {
          throw error
        }

        // Don't retry on the last attempt
        if (attempt === retries) {
          break
        }

        // Wait before retrying
        await delay(retryDelay * (attempt + 1))
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error('Request failed after all retries')
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint, params)
    return this.request<T>(url, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: isFormData ? { Accept: 'application/json' } : undefined,
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await this.get('/api/health')
    return response.data
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export the class for testing or custom instances
export { ApiClient }
