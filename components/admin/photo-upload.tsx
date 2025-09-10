'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader,
} from 'lucide-react'
import { toast } from 'sonner'

interface UploadedImage {
  id: string
  url: string
  name: string
  size: number
  spotId?: string
  status: 'uploading' | 'success' | 'error'
  progress: number
}

interface SpotOption {
  id: string
  title: string
}

// Mock spots data - in real implementation, this would come from an API
const mockSpots: SpotOption[] = [
  { id: '1', title: 'Beautiful Beach Resort' },
  { id: '2', title: 'Mountain Adventure Park' },
  { id: '3', title: 'Historic City Center' },
  { id: '4', title: 'Cultural Heritage Site' },
]

export function PhotoUpload() {
  const [uploadedImages, setUploadedImages] = useState<
    UploadedImage[]
  >([])
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [selectedSpot, setSelectedSpot] = useState<string>('')

  const handleFileUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })

    for (const file of validFiles) {
      const imageId = crypto.randomUUID()
      const newImage: UploadedImage = {
        id: imageId,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        spotId: selectedSpot || undefined,
        status: 'uploading',
        progress: 0,
      }

      setUploadedImages((prev) => [...prev, newImage])

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, progress: Math.min(img.progress + 10, 90) }
              : img
          )
        )
      }, 200)

      try {
        // Simulate API upload
        await new Promise((resolve) => setTimeout(resolve, 2000))

        clearInterval(progressInterval)

        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, status: 'success', progress: 100 }
              : img
          )
        )

        toast.success(`${file.name} uploaded successfully`)
      } catch (error) {
        clearInterval(progressInterval)

        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, status: 'error', progress: 0 }
              : img
          )
        )

        toast.error(`Failed to upload ${file.name}`)
      }
    }
  }

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return

    const imageId = crypto.randomUUID()
    const newImage: UploadedImage = {
      id: imageId,
      url: urlInput,
      name: 'Image from URL',
      size: 0,
      spotId: selectedSpot || undefined,
      status: 'uploading',
      progress: 0,
    }

    setUploadedImages((prev) => [...prev, newImage])
    setUrlInput('')

    // Simulate processing
    const progressInterval = setInterval(() => {
      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, progress: Math.min(img.progress + 20, 90) }
            : img
        )
      )
    }, 100)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      clearInterval(progressInterval)

      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, status: 'success', progress: 100 }
            : img
        )
      )

      toast.success('Image added from URL')
    } catch (error) {
      clearInterval(progressInterval)

      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, status: 'error', progress: 0 }
            : img
        )
      )

      toast.error('Failed to add image from URL')
    }
  }

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))
  }

  const retryUpload = (id: string) => {
    setUploadedImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, status: 'uploading', progress: 0 }
          : img
      )
    )

    // Simulate retry
    setTimeout(() => {
      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? { ...img, status: 'success', progress: 100 }
            : img
        )
      )
      toast.success('Upload successful')
    }, 1500)
  }

  const assignToSpot = async (imageId: string, spotId: string) => {
    setUploadedImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, spotId } : img
      )
    )

    // Here you would make an API call to assign the image to the spot
    toast.success('Image assigned to listing')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Photos</CardTitle>
            <CardDescription>
              Upload images from your device (max 10MB each)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Assign to Listing (Optional)</Label>
                <Select
                  value={selectedSpot}
                  onValueChange={setSelectedSpot}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a listing..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No assignment</SelectItem>
                    {mockSpots.map((spot) => (
                      <SelectItem key={spot.id} value={spot.id}>
                        {spot.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const files = e.dataTransfer.files
                  if (files.length > 0) {
                    handleFileUpload(files)
                  }
                }}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    Drop images here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports JPG, PNG, WebP up to 10MB
                  </p>
                </div>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-4"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files)
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URL Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Add from URL</CardTitle>
            <CardDescription>
              Add images directly from web URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Assign to Listing (Optional)</Label>
                <Select
                  value={selectedSpot}
                  onValueChange={setSelectedSpot}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a listing..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No assignment</SelectItem>
                    {mockSpots.map((spot) => (
                      <SelectItem key={spot.id} value={spot.id}>
                        {spot.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && handleUrlUpload()
                  }
                />
                <Button
                  onClick={handleUrlUpload}
                  disabled={!urlInput.trim()}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>• Image URL must be publicly accessible</p>
                <p>
                  • Supports direct links to JPG, PNG, WebP formats
                </p>
                <p>• Images will be optimized automatically</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Uploaded Images ({uploadedImages.length})
            </CardTitle>
            <CardDescription>
              Manage your uploaded photos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {uploadedImages.map((image) => (
                <div
                  key={image.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {image.name}
                      </p>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {image.size > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(image.size)}
                      </p>
                    )}

                    {image.status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress
                          value={image.progress}
                          className="h-2"
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader className="h-3 w-3 animate-spin" />
                          Uploading... {image.progress}%
                        </div>
                      </div>
                    )}

                    {image.status === 'success' && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Check className="h-3 w-3" />
                        Upload complete
                      </div>
                    )}

                    {image.status === 'error' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          Upload failed
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryUpload(image.id)}
                        >
                          Retry
                        </Button>
                      </div>
                    )}

                    {image.spotId ? (
                      <Badge variant="secondary" className="text-xs">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {mockSpots.find((s) => s.id === image.spotId)
                          ?.title || 'Assigned'}
                      </Badge>
                    ) : (
                      <Select
                        onValueChange={(spotId) =>
                          assignToSpot(image.id, spotId)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Assign to listing..." />
                        </SelectTrigger>
                        <SelectContent>
                          {mockSpots.map((spot) => (
                            <SelectItem key={spot.id} value={spot.id}>
                              {spot.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
