"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Calendar, MapPin, Clock, Plus, Trash2, Edit2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useItineraries } from "@/lib/api"
import type { Itinerary } from "@/lib/itinerary-store"
import { BottomTabs } from "@/components/ui/bottom-tabs"
import { useAuth } from '@/hooks/use-auth'

function PlansPageContent() {
  const { data: itineraries, loading, error, refresh } = useItineraries() as {
    data: Itinerary[] | null
    loading: boolean
    error: Error | null
    refresh: () => Promise<void>
  }

  const { user, loading: authLoading } = useAuth()

  // Consistent date formatting to prevent hydration mismatches
  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return 'No dates set'
    if (!end) return start
    
    // Use consistent date formatting that works the same on server and client
    const startDate = new Date(start)
    const endDate = new Date(end)
    
    const formatDate = (date: Date, includeYear = true) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
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
    return Object.values(itinerary.days).reduce((total, spots) => total + spots.length, 0)
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight">My Plans</h1>
            <p className="text-base text-muted-foreground mt-1">Manage your travel itineraries</p>
          </header>
          <div className="text-center py-12">
            <div className="text-gray-500">Loading...</div>
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
            <h1 className="text-4xl font-extrabold tracking-tight">My Plans</h1>
            <p className="text-base text-muted-foreground mt-1">Manage your travel itineraries</p>
          </header>
          
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in required</h3>
            <p className="text-gray-500 mb-6">Please sign in to view and manage your travel plans</p>
            <Link
              href="/auth"
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
            <h1 className="text-4xl font-extrabold tracking-tight">My Plans</h1>
            <p className="text-base text-muted-foreground mt-1">Manage your travel itineraries</p>
          </header>
          
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[200px] animate-pulse rounded-3xl bg-gray-200" />
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
            <h1 className="text-4xl font-extrabold tracking-tight">My Plans</h1>
            <p className="text-base text-muted-foreground mt-1">Manage your travel itineraries</p>
          </header>
          
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Unable to load your plans. Please try again later.</p>
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
            <h1 className="text-4xl font-extrabold tracking-tight">My Plans</h1>
            <p className="text-base text-muted-foreground mt-1">Manage your travel itineraries</p>
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[200px] animate-pulse rounded-3xl bg-gray-200" />
            ))}
          </div>
        ) : !itineraries || itineraries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No plans yet</h3>
            <p className="text-gray-500 mb-6">Create your first travel itinerary to get started</p>
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
              />
            ))}
          </div>
        )}
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
            <h1 className="text-4xl font-extrabold tracking-tight">My Plans</h1>
            <p className="text-base text-muted-foreground mt-1">Manage your travel itineraries</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full animate-pulse h-10 w-24"></div>
        </header>
        
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[200px] animate-pulse rounded-3xl bg-gray-200" />
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
}

function ItineraryCard({ itinerary }: ItineraryCardProps) {
  const router = useRouter()
  // Consistent date formatting to prevent hydration mismatches
  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return 'No dates set'
    if (!end) return start
    
    // Use consistent date formatting that works the same on server and client
    const startDate = new Date(start)
    const endDate = new Date(end)
    
    const formatDate = (date: Date, includeYear = true) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
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
    return Object.values(itinerary.days).reduce((total, spots) => total + spots.length, 0)
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
            src={displayImage}
            alt={itinerary.title || 'Itinerary'}
            className="w-full h-32 object-cover rounded-t-3xl"
          />
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 pr-16">
            {itinerary.title || 'Untitled Trip'}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDateRange(itinerary.start, itinerary.end)}</span>
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
