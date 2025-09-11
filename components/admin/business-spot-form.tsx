'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  X,
  Save,
  ArrowLeft,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/config'
import { uploadFile } from '@/lib/supabase/storage'
import { getImageUrl } from '@/lib/utils/image'
import { Database } from '@/types/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface BusinessSpotFormProps {
  ownerId: string
  initialData?: Database['public']['Tables']['spots']['Row']
}

interface FormData {
  title: string
  location: string
  description: string
  tags: string[]
  amenities: string[]
  lat: number | null
  lng: number | null
  pricing: {
    currency: string
    ranges: Array<{
      type: string
      min: number
      max: number
    }>
  }
}

export function BusinessSpotForm({
  ownerId,
  initialData,
}: BusinessSpotFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [amenityInput, setAmenityInput] = useState('')
  const [images, setImages] = useState<string[]>(
    initialData?.images || []
  )
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Helper function to safely parse pricing data
  const initializePricing = (
    pricingData: any
  ): FormData['pricing'] => {
    const defaultPricing = {
      currency: 'PHP',
      ranges: [{ type: 'entrance', min: 0, max: 100 }],
    }

    if (!pricingData) return defaultPricing

    // Handle different pricing data structures
    try {
      const pricing =
        typeof pricingData === 'string'
          ? JSON.parse(pricingData)
          : pricingData

      if (pricing && typeof pricing === 'object') {
        // Handle existing database format: {oneNight, twoNights, pricePerNight}
        if (pricing.pricePerNight !== undefined) {
          return {
            currency: 'PHP',
            ranges: [
              {
                type: 'entrance',
                min: pricing.pricePerNight || 0,
                max: Math.floor((pricing.pricePerNight || 0) * 1.5),
              },
            ],
          }
        }

        // Handle our form format: {currency, ranges}
        return {
          currency: pricing.currency || 'PHP',
          ranges:
            Array.isArray(pricing.ranges) && pricing.ranges.length > 0
              ? pricing.ranges
              : [
                  {
                    type: 'entrance',
                    min: pricing.min || 0,
                    max: pricing.max || 100,
                  },
                ],
        }
      }
    } catch (error) {
      console.warn('Failed to parse pricing data:', error)
    }

    return defaultPricing
  }

  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    location: initialData?.location || '',
    description: initialData?.description || '',
    tags: initialData?.tags || [],
    amenities: initialData?.amenities || [],
    lat: initialData?.lat || null,
    lng: initialData?.lng || null,
    pricing: initializePricing(initialData?.pricing),
  })

  // Using the configured Supabase client

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true)

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload only image files (JPG, PNG, WEBP)')
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB')
        return
      }

      // Check image limit
      if (images.length >= 10) {
        alert('Maximum 10 images allowed')
        return
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `spots/${generateSlug(formData.title || 'untitled')}/${fileName}`

      // Upload to Supabase Storage
      await uploadFile({
        bucket: 'images',
        path: filePath,
        file,
      })

      // Add the path to images array
      const imagePath = `/images/${filePath}`
      setImages((prev) => [...prev, imagePath])
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Remove image from list
  const removeImage = (indexToRemove: number) => {
    setImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    )
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    files.forEach((file) => {
      if (file.type.startsWith('image/') && images.length < 10) {
        handleImageUpload(file)
      }
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Check if slug exists and generate unique one
  const generateUniqueSlug = async (
    baseSlug: string,
    excludeId?: string
  ): Promise<string> => {
    // Ensure base slug is not empty
    if (!baseSlug || baseSlug.trim() === '') {
      baseSlug = 'untitled-spot'
    }

    let slug = baseSlug
    let counter = 1

    while (counter < 100) {
      // Prevent infinite loops
      const { data: existingSpot, error } = await supabase
        .from('spots')
        .select('id')
        .eq('slug', slug)
        .single()

      // If there's an error (like PGRST116 - no rows), the slug is available
      if (
        error ||
        !existingSpot ||
        (excludeId && existingSpot.id === excludeId)
      ) {
        return slug
      }

      // Generate new slug with counter
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Fallback with timestamp if we hit the limit
    return `${baseSlug}-${Date.now()}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const baseSlug = generateSlug(formData.title)
      console.log('Generating unique slug for:', baseSlug)
      const uniqueSlug = await generateUniqueSlug(
        baseSlug,
        initialData?.id
      )
      console.log('Using unique slug:', uniqueSlug)

      // Prepare spot data with proper typing and validation
      const minPrice = formData.pricing?.ranges?.[0]?.min || 0
      const maxPrice = formData.pricing?.ranges?.[0]?.max || 100

      // Convert our pricing format to match the existing database structure
      const dbPricing = {
        oneNight: `from ₱${minPrice}`,
        twoNights: `from ₱${Math.floor(minPrice * 1.8)}`,
        pricePerNight: minPrice,
      }

      const spotData = {
        id: uniqueSlug, // Use unique slug as ID to match existing data pattern
        title: formData.title.trim(),
        slug: uniqueSlug,
        location: formData.location.trim(),
        description: formData.description.trim(),
        tags: formData.tags.filter((tag) => tag.trim()),
        amenities: formData.amenities.filter((amenity) =>
          amenity.trim()
        ),
        lat: formData.lat,
        lng: formData.lng,
        pricing: dbPricing,
        owner_id: ownerId,
        images,
        rating: initialData?.rating || 0,
        reviews: initialData?.reviews || 0,
      }

      console.log('Saving spot data:', spotData)

      if (initialData) {
        // Update existing spot - exclude id from update data
        const { id, ...updateData } = spotData
        const { data, error } = await supabase
          .from('spots')
          .update(updateData)
          .eq('id', initialData.id)
          .eq('owner_id', ownerId) // Security check
          .select()

        if (error) {
          console.error('Update error details:', error)
          throw new Error(`Failed to update spot: ${error.message}`)
        }
        console.log('Update successful:', data)
      } else {
        // Create new spot - let Supabase generate the ID if it's using auto-increment
        const { data, error } = await supabase
          .from('spots')
          .insert([spotData])
          .select()

        if (error) {
          console.error('Insert error details:', error)
          throw new Error(`Failed to create spot: ${error.message}`)
        }
        console.log('Insert successful:', data)
      }

      router.push('/business/spots')
      router.refresh()
    } catch (error) {
      console.error('Error saving spot:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error occurred'
      alert(`Error saving spot: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const addAmenity = () => {
    if (
      amenityInput.trim() &&
      !formData.amenities.includes(amenityInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()],
      }))
      setAmenityInput('')
    }
  }

  const removeAmenity = (amenityToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter(
        (amenity) => amenity !== amenityToRemove
      ),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/business/spots">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Spots
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential details about your tourist spot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Spot Name</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="e.g., Mayon Volcano View Point"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="e.g., Albay, Philippines"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what makes this spot special..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>
              Upload photos of your tourist spot (max 10 images)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  files.forEach((file) => {
                    if (images.length < 10) {
                      handleImageUpload(file)
                    }
                  })
                  e.target.value = '' // Reset input
                }}
                className="hidden"
                id="image-upload"
                disabled={isUploadingImage || images.length >= 10}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer ${isUploadingImage || images.length >= 10 ? 'opacity-50' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  {isUploadingImage ? (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 animate-pulse" />
                      <p className="text-sm text-gray-600">
                        Uploading...
                      </p>
                    </>
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {images.length >= 10
                          ? 'Maximum 10 images reached'
                          : 'Click to upload images or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG, WEBP up to 10MB each
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((imagePath, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={
                          getImageUrl(imagePath) ||
                          '/placeholder-user.jpg'
                        }
                        alt={`Spot image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Image {index + 1}
                      {index === 0 && (
                        <span className="text-teal-600 font-medium">
                          {' '}
                          (Main)
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No images uploaded yet. Add some photos to showcase
                your spot!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Coordinates</CardTitle>
            <CardDescription>
              Precise location for map display (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={formData.lat || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lat: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    }))
                  }
                  placeholder="e.g., 13.2572"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={formData.lng || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lng: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    }))
                  }
                  placeholder="e.g., 123.7461"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Keywords that describe your spot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addTag())
                }
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>
              Facilities and services available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                placeholder="Add an amenity..."
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  (e.preventDefault(), addAmenity())
                }
              />
              <Button
                type="button"
                onClick={addAmenity}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity) => (
                <Badge
                  key={amenity}
                  variant="outline"
                  className="gap-1"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>
              Entrance fees and costs (PHP)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-price">Minimum Price</Label>
                <Input
                  id="min-price"
                  type="number"
                  value={formData.pricing?.ranges?.[0]?.min || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        ranges: [
                          {
                            ...(prev.pricing?.ranges?.[0] || {
                              type: 'entrance',
                              max: 100,
                            }),
                            min: parseInt(e.target.value) || 0,
                          },
                        ],
                      },
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-price">Maximum Price</Label>
                <Input
                  id="max-price"
                  type="number"
                  value={formData.pricing?.ranges?.[0]?.max || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        ranges: [
                          {
                            ...(prev.pricing?.ranges?.[0] || {
                              type: 'entrance',
                              min: 0,
                            }),
                            max: parseInt(e.target.value) || 0,
                          },
                        ],
                      },
                    }))
                  }
                  placeholder="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/business/spots">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isLoading ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {initialData ? 'Update Spot' : 'Create Spot'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
