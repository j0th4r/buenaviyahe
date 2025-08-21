import { getStorageUrl } from '../supabase/storage'

export function getImageUrl(path: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}): string {
  // If it's already a full URL, return as is
  if (path.startsWith('http')) {
    return path
  }

  // If it's a local path, convert to storage URL
  if (path.startsWith('/images/')) {
    const cleanPath = path.replace('/images/', '')
    
    return getStorageUrl({
      bucket: 'images',
      path: cleanPath,
      transform: options
    })
  }

  // Fallback to original path
  return path
}
