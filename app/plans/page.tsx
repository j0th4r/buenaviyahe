'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Plus, Search, Edit2, Trash2, MoreVertical } from 'lucide-react'
import { useItineraries, updateItinerary, deleteItinerary } from '@/lib/api'
import { getImageUrl } from '@/lib/utils/image'
import { Suspense, useState, useEffect } from 'react'
import { BottomTabs } from '@/components/ui/bottom-tabs'
import { cn } from '@/lib/utils'
import type { Itinerary } from '@/lib/itinerary-store'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function PlansPageContent() {
  const {
    data: itineraries,
    loading,
    error,
    refresh,
  } = useItineraries() as {
    data: Itinerary[] | null
    loading: boolean
    error: Error | null
    refresh: () => Promise<void>
  }

  const { user, loading: authLoading } = useAuth()
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null)
  const [deletingItinerary, setDeletingItinerary] = useState<Itinerary | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Consistent date formatting to prevent hydration mismatches
  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return 'No dates set'
    if (!end) return start

    // Use consistent date formatting that works the same on server and client
    const startDate = new Date(start)
    const endDate = new Date(end)

    const formatDate = (date: Date, includeYear = true) => {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]
      const month = months[date.getMonth()]
      const day = date.getDate()
      const year = includeYear ? ` ${date.getFullYear()}` : ''
      return `${month} ${day}${year}`
    }

    const startFormatted = formatDate(startDate, false)
    const endFormatted = formatDate(endDate, true)

    return `${startFormatted} - ${endFormatted}`
  }

  const getTotalSpots = (itinerary: Itinerary) => {
    if (!itinerary.days) return 0
    return Object.values(itinerary.days).reduce(
      (total, spots) => total + spots.length,
      0
    )
  }

  const handleEditClick = (itinerary: Itinerary, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditTitle(itinerary.title || '')
    setEditStart(itinerary.start || '')
    setEditEnd(itinerary.end || '')
    setEditingItinerary(itinerary)
  }

  const handleDeleteClick = (itinerary: Itinerary, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingItinerary(itinerary)
  }

  const handleSaveEdit = async () => {
    if (!editingItinerary) return

    try {
      setIsSaving(true)
      await updateItinerary(editingItinerary.id, {
        title: editTitle || undefined,
        start: editStart || undefined,
        end: editEnd || undefined,
      })
      setEditingItinerary(null)
      await refresh()
    } catch (error) {
      console.error('Failed to update itinerary:', error)
      alert('Failed to update itinerary. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingItinerary) return

    try {
      setIsDeleting(true)
      await deleteItinerary(deletingItinerary.id)
      setDeletingItinerary(null)
      await refresh()
    } catch (error) {
      console.error('Failed to delete itinerary:', error)
      alert('Failed to delete itinerary. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
          <header className="mb-6">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
          </header>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[280px] bg-gray-200 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        </main>
        <BottomTabs />
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight">
              My Plans
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Manage your travel itineraries
            </p>
          </header>

          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign in required
            </h3>
            <p className="text-gray-500 mb-6">
              Please sign in to view and manage your travel plans
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </main>
        <BottomTabs />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight">
              My Plans
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Manage your travel itineraries
            </p>
          </header>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[200px] animate-pulse rounded-3xl bg-gray-200"
              />
            ))}
          </div>
        </main>
        <BottomTabs />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight">
              My Plans
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Manage your travel itineraries
            </p>
          </header>

          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Unable to load your plans. Please try again later.
            </p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
        <BottomTabs />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              My Plans
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Manage your travel itineraries
            </p>
          </div>
          {/* <Link
            href="/planner/new"
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">New Plan</span>
          </Link> */}
        </header>

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[200px] animate-pulse rounded-3xl bg-gray-200"
              />
            ))}
          </div>
        ) : !itineraries || itineraries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No plans yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first travel itinerary to get started
            </p>
            <Link
              href="/planner/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Your First Plan
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {itineraries.map((itinerary: Itinerary) => (
              <ItineraryCard
                key={itinerary.id}
                itinerary={itinerary}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingItinerary} onOpenChange={(open) => !open && setEditingItinerary(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter plan title"
                />
              </div>
              <div>
                <label htmlFor="edit-start" className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <Input
                  id="edit-start"
                  type="date"
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-end" className="block text-sm font-medium mb-1">
                  End Date
                </label>
                <Input
                  id="edit-end"
                  type="date"
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingItinerary(null)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingItinerary} onOpenChange={(open) => !open && setDeletingItinerary(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingItinerary?.title || 'Untitled Plan'}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <BottomTabs />
    </div>
  )
}

// Loading component for Suspense fallback
function PlansPageLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              My Plans
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Manage your travel itineraries
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full animate-pulse h-10 w-24"></div>
        </header>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[200px] animate-pulse rounded-3xl bg-gray-200"
            />
          ))}
        </div>
      </main>
      <BottomTabs />
    </div>
  )
}

// Main page component wrapped in Suspense to prevent hydration issues
export default function PlansPage() {
  return (
    <Suspense fallback={<PlansPageLoading />}>
      <PlansPageContent />
    </Suspense>
  )
}

type ItineraryCardProps = {
  itinerary: Itinerary
  onEdit: (itinerary: Itinerary, e: React.MouseEvent) => void
  onDelete: (itinerary: Itinerary, e: React.MouseEvent) => void
}

function ItineraryCard({ itinerary, onEdit, onDelete }: ItineraryCardProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  // Consistent date formatting to prevent hydration mismatches
  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return 'No dates set'
    if (!end) return start

    // Use consistent date formatting that works the same on server and client
    const startDate = new Date(start)
    const endDate = new Date(end)

    const formatDate = (date: Date, includeYear = true) => {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]
      const month = months[date.getMonth()]
      const day = date.getDate()
      const year = includeYear ? ` ${date.getFullYear()}` : ''
      return `${month} ${day}${year}`
    }

    const startFormatted = formatDate(startDate, false)
    const endFormatted = formatDate(endDate, true)

    return `${startFormatted} - ${endFormatted}`
  }

  const getTotalSpots = (itinerary: Itinerary) => {
    if (!itinerary.days) return 0
    return Object.values(itinerary.days).reduce(
      (total, spots) => total + spots.length,
      0
    )
  }

  const getDaysCount = (itinerary: Itinerary) => {
    if (!itinerary.days) return 0
    return Object.keys(itinerary.days).length
  }

  const displayImage = itinerary.days?.[1]?.[0]?.image

  return (
    <article
      className="relative bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/plans/${itinerary.id}`)}
    >
      {displayImage && (
        <div className="mb-4 -mx-6 -mt-6">
          <img
            src={getImageUrl(displayImage)}
            alt={itinerary.title || 'Itinerary'}
            className="w-full h-32 object-cover rounded-t-3xl"
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex-1 pr-2">
            {itinerary.title || 'Untitled Trip'}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
            {showMenu && (
              <>
                <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                  <button
                    onClick={(e) => {
                      onEdit(itinerary, e)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      onDelete(itinerary, e)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                  }}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDateRange(itinerary.start, itinerary.end)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{getDaysCount(itinerary)} days</span>
          </div>
          <div>
            <span>{getTotalSpots(itinerary)} spots</span>
          </div>
        </div>
      </div>
    </article>
  )
}
