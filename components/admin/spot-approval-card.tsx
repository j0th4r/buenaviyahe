'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Calendar,
  Camera,
} from 'lucide-react'
import { getImageUrl } from '@/lib/utils/image'

type SpotWithStatus = {
  id: string
  title: string
  slug: string
  location: string
  description: string
  tags: string[]
  images: string[]
  rating: number
  reviews: number
  pricing: any
  amenities: string[]
  lat?: number
  lng?: number
  owner_id?: string
  created_at: string
  updated_at: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string | null
  submitter?: {
    id: string
    name: string
    avatar_url?: string
    role: string
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="border-orange-200 text-orange-700"
        >
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant="default" className="bg-green-700 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      )
    default:
      return null
  }
}

export function SpotApprovalCard({ spot }: { spot: SpotWithStatus }) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  const handleStatusUpdate = async (
    newStatus: 'approved' | 'rejected'
  ) => {
    setIsUpdating(true)
    try {
      const response = await fetch(
        `/api/admin/spots/${spot.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            notes: reviewNotes,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          data: data,
        })
        throw new Error(
          data.error || `Failed to update status (${response.status})`
        )
      }

      toast({
        title: 'Success',
        description: data.message,
      })

      // Refresh the page to update the spot lists
      router.refresh()
    } catch (error) {
      console.error('Error updating spot status:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update spot status',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card
      className={
        spot.status === 'pending'
          ? 'border-orange-200 bg-orange-50/30'
          : ''
      }
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Spot Image */}
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {spot.images && spot.images.length > 0 ? (
              <img
                src={getImageUrl(spot.images[0], {
                  width: 80,
                  height: 80,
                  quality: 80,
                })}
                alt={spot.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-teal-950">
                  {spot.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{spot.location}</span>
                </div>
              </div>
              {getStatusBadge(spot.status)}
            </div>

            {/* Submitter Info */}
            {spot.submitter && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={spot.submitter.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {spot.submitter.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  Submitted by{' '}
                  <span className="font-medium">
                    {spot.submitter.name}
                  </span>
                </span>
                <Badge variant="outline" className="text-xs">
                  {spot.submitter.role === 'business_owner'
                    ? 'Business Owner'
                    : 'User'}
                </Badge>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-teal-900 line-clamp-2">
              {spot.description}
            </p>

            {/* Tags */}
            {spot.tags && spot.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {spot.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {spot.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{spot.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Submitted{' '}
                  {formatDate(spot.submitted_at || spot.created_at)}
                </span>
              </div>
              {spot.images && (
                <div className="flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  <span>{spot.images.length} photos</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {spot.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Review Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Review Spot Proposal</DialogTitle>
                      <DialogDescription>
                        {spot.title} - Submitted by{' '}
                        {spot.submitter?.name}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* Basic Info */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium">
                            Spot Name
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {spot.title}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Location
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {spot.location}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {spot.description}
                        </p>
                      </div>

                      {/* Tags */}
                      {spot.tags && spot.tags.length > 0 && (
                        <div>
                          <label className="text-sm font-medium">
                            Categories
                          </label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {spot.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Amenities */}
                      {spot.amenities &&
                        spot.amenities.length > 0 && (
                          <div>
                            <label className="text-sm font-medium">
                              Amenities
                            </label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {spot.amenities.map((amenity) => (
                                <Badge
                                  key={amenity}
                                  variant="outline"
                                >
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Images */}
                      {spot.images && spot.images.length > 0 && (
                        <div>
                          <label className="text-sm font-medium">
                            Photos ({spot.images.length})
                          </label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {spot.images
                              .slice(0, 6)
                              .map((image, index) => (
                                <div
                                  key={index}
                                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                                >
                                  <img
                                    src={getImageUrl(image, {
                                      width: 200,
                                      height: 200,
                                      quality: 80,
                                    })}
                                    alt={`${spot.title} ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Compliance Checklist */}
                      <div className="border-t pt-4">
                        <label className="text-sm font-medium text-teal-950">
                          LGU Compliance Review
                        </label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="business-permit"
                              className="rounded"
                            />
                            <label
                              htmlFor="business-permit"
                              className="text-sm"
                            >
                              Business permit verified
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="location-verified"
                              className="rounded"
                            />
                            <label
                              htmlFor="location-verified"
                              className="text-sm"
                            >
                              Location within LGU jurisdiction
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="safety-standards"
                              className="rounded"
                            />
                            <label
                              htmlFor="safety-standards"
                              className="text-sm"
                            >
                              Meets safety and tourism standards
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="environmental"
                              className="rounded"
                            />
                            <label
                              htmlFor="environmental"
                              className="text-sm"
                            >
                              Environmental compliance checked
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Review Notes */}
                      <div>
                        <label className="text-sm font-medium">
                          Review Notes
                        </label>
                        <Textarea
                          placeholder="Add notes about this proposal (optional)"
                          className="mt-1"
                          value={reviewNotes}
                          onChange={(e) =>
                            setReviewNotes(e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <DialogFooter className="gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            disabled={isUpdating}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Reject Spot Proposal
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reject "
                              {spot.title}"? This action cannot be
                              undone. The business owner will be
                              notified of the rejection.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() =>
                                handleStatusUpdate('rejected')
                              }
                            >
                              Reject Proposal
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isUpdating}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Approve Spot Proposal
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to approve "
                              {spot.title}"? This will make the
                              tourism spot visible to all users on the
                              platform.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                handleStatusUpdate('approved')
                              }
                            >
                              Approve Proposal
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={isUpdating}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Quick Approve
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isUpdating}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
