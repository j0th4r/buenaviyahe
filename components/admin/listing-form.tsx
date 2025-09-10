'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader, X, Plus, MapPin } from 'lucide-react'
import { toast } from 'sonner'

const listingSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  location: z.string().min(1, 'Location is required'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  pricing: z.object({
    type: z.enum(['free', 'paid', 'varies']),
    adult: z.number().min(0).optional(),
    child: z.number().min(0).optional(),
    notes: z.string().optional(),
  }),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
})

type ListingFormValues = z.infer<typeof listingSchema>

interface ListingFormProps {
  initialData?: any
  isEditing?: boolean
}

const commonAmenities = [
  'Parking',
  'WiFi',
  'Restaurant',
  'Gift Shop',
  'Restrooms',
  'Wheelchair Accessible',
  'Air Conditioning',
  'Swimming Pool',
  'Beach Access',
  'Hiking Trails',
  'Guided Tours',
  'Photography Allowed',
  'Pet Friendly',
  'Family Friendly',
  'Lockers',
  'First Aid',
]

const commonTags = [
  'popular',
  'featured',
  'new',
  'family-friendly',
  'adventure',
  'cultural',
  'historical',
  'natural',
  'beach',
  'mountain',
  'city',
  'religious',
  'educational',
  'romantic',
]

export function ListingForm({
  initialData,
  isEditing = false,
}: ListingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [amenities, setAmenities] = useState<string[]>(
    initialData?.amenities || []
  )
  const [images, setImages] = useState<string[]>(
    initialData?.images || []
  )
  const [newTag, setNewTag] = useState('')
  const [newAmenity, setNewAmenity] = useState('')
  const [newImage, setNewImage] = useState('')

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      location: initialData?.location || '',
      description: initialData?.description || '',
      pricing: {
        type: initialData?.pricing?.type || 'free',
        adult: initialData?.pricing?.adult || 0,
        child: initialData?.pricing?.child || 0,
        notes: initialData?.pricing?.notes || '',
      },
      lat: initialData?.lat || undefined,
      lng: initialData?.lng || undefined,
    },
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setNewTag('')
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const addAmenity = (amenity: string) => {
    if (amenity && !amenities.includes(amenity)) {
      setAmenities([...amenities, amenity])
    }
    setNewAmenity('')
  }

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity))
  }

  const addImage = () => {
    if (newImage && !images.includes(newImage)) {
      setImages([...images, newImage])
      setNewImage('')
    }
  }

  const removeImage = (image: string) => {
    setImages(images.filter((i) => i !== image))
  }

  const onSubmit = async (values: ListingFormValues) => {
    setIsLoading(true)

    try {
      const payload = {
        ...values,
        tags,
        amenities,
        images,
        rating: initialData?.rating || 0,
        reviews: initialData?.reviews || 0,
      }

      const url = isEditing
        ? `/api/admin/spots/${initialData.id}`
        : '/api/admin/spots'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save listing')
      }

      toast.success(
        isEditing ? 'Listing updated!' : 'Listing created!'
      )
      router.push('/admin/listings')
      router.refresh()
    } catch (error) {
      console.error('Error saving listing:', error)
      toast.error('Failed to save listing')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your tourist spot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Beautiful Beach Resort"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          if (!isEditing) {
                            form.setValue(
                              'slug',
                              generateSlug(e.target.value)
                            )
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="beautiful-beach-resort"
                        disabled={isEditing}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {isEditing
                        ? 'Cannot be changed when editing (slug is used as record ID)'
                        : 'Used in the URL. Only lowercase letters, numbers, and hyphens.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Boracay, Aklan, Philippines"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your tourist spot..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location & Pricing</CardTitle>
              <CardDescription>
                Geographic coordinates and pricing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="11.9674"
                          {...field}
                          value={
                            field.value === undefined ||
                            field.value === null
                              ? ''
                              : String(field.value)
                          }
                          onChange={(e) => {
                            const value =
                              e.target.value === ''
                                ? undefined
                                : parseFloat(e.target.value)
                            field.onChange(
                              value === undefined || isNaN(value)
                                ? undefined
                                : value
                            )
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="121.9247"
                          {...field}
                          value={
                            field.value === undefined ||
                            field.value === null
                              ? ''
                              : String(field.value)
                          }
                          onChange={(e) => {
                            const value =
                              e.target.value === ''
                                ? undefined
                                : parseFloat(e.target.value)
                            field.onChange(
                              value === undefined || isNaN(value)
                                ? undefined
                                : value
                            )
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="pricing.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pricing type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="varies">Varies</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('pricing.type') === 'paid' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pricing.adult"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adult Price (₱)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            value={
                              field.value === undefined ||
                              field.value === null
                                ? ''
                                : String(field.value)
                            }
                            onChange={(e) => {
                              const value =
                                e.target.value === ''
                                  ? 0
                                  : parseFloat(e.target.value)
                              field.onChange(isNaN(value) ? 0 : value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pricing.child"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child Price (₱)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            value={
                              field.value === undefined ||
                              field.value === null
                                ? ''
                                : String(field.value)
                            }
                            onChange={(e) => {
                              const value =
                                e.target.value === ''
                                  ? 0
                                  : parseFloat(e.target.value)
                              field.onChange(isNaN(value) ? 0 : value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="pricing.notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional pricing information..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Categorize your listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), addTag(newTag))
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addTag(newTag)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Common tags:
                  <div className="flex flex-wrap gap-1 mt-1">
                    {commonTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>
                Available facilities and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline">
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add amenity..."
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), addAmenity(newAmenity))
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addAmenity(newAmenity)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Common amenities:
                  <div className="flex flex-wrap gap-1 mt-1">
                    {commonAmenities.map((amenity) => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => addAmenity(amenity)}
                        className="px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80"
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                Photo URLs for your listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded"
                    >
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <span className="text-xs text-muted-foreground flex-1 truncate">
                        {image}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(image)}
                        className="hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Image URL..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), addImage())
                    }
                  />
                  <Button type="button" size="sm" onClick={addImage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            )}
            {isEditing ? 'Update Listing' : 'Create Listing'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
