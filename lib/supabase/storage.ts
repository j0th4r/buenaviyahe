import { supabase } from './config'

export interface UploadOptions {
  bucket: 'images'
  path: string
  file: File
  contentType?: string
}

export interface StorageUrlOptions {
  bucket: 'images'
  path: string
  transform?: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  }
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile({ bucket, path, file, contentType }: UploadOptions) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: contentType || file.type,
        upsert: true
      })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

/**
 * Get a public URL for a file in Supabase Storage
 */
export function getStorageUrl({ bucket, path, transform }: StorageUrlOptions): string {
  const baseUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  
  if (!transform) return baseUrl
  
  // Add transformation parameters
  const params = new URLSearchParams()
  if (transform.width) params.append('width', transform.width.toString())
  if (transform.height) params.append('height', transform.height.toString())
  if (transform.quality) params.append('quality', transform.quality.toString())
  if (transform.format) params.append('format', transform.format)
  
  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
    return true
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

/**
 * List files in a bucket/folder
 */
export async function listFiles(bucket: string, folder?: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || '')

    if (error) throw error
    return data
  } catch (error) {
    console.error('List error:', error)
    throw error
  }
}
