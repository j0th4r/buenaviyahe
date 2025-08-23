'use client'

import React from 'react'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import {
  useRouter,
  useSearchParams,
  useParams,
} from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  StarHalf,
  Plane,
  BedDouble,
  ChevronRight as ChevronRightSmall,
  ChevronDown,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { appendSpot, getItinerary } from '@/lib/itinerary-store'
import { useSpot } from '@/lib/api'
import type { Spot as DbSpot } from '@/lib/api/spots'
import { getImageUrl } from '@/lib/utils/image'

function clampIndex(i: number, len: number) {
  return ((i % len) + len) % len
}

export default function SpotPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: spot, loading, error } = useSpot(slug)

  // All hooks must be called at the top level, before any conditional logic
  const [index, setIndex] = useState(0)
  const [openDrawer, setOpenDrawer] = useState(false)
  const router = useRouter()

  // Define functions that depend on spot data
  const goPrev = useCallback(() => {
    if (spot?.images) {
      setIndex((i) => clampIndex(i - 1, spot.images.length))
    }
  }, [spot?.images])

  const goNext = useCallback(() => {
    if (spot?.images) {
      setIndex((i) => clampIndex(i + 1, spot.images.length))
    }
  }, [spot?.images])

  const goTo = useCallback(
    (i: number) => {
      if (spot?.images) {
        setIndex(clampIndex(i, spot.images.length))
      }
    },
    [spot?.images]
  )

  // useEffect must be called unconditionally
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])

  // Now we can handle loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  // Show error or not found
  if (error || !spot) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white/90">Spot not found</div>
      </div>
    )
  }

  const fullStars = Math.floor(spot.rating)
  const hasHalf = spot.rating % 1 >= 0.5
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0))

  return (
    <>
      <div className="relative min-h-screen bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          {spot.images.map((src, i) => (
            <img
              key={src + i}
              src={getImageUrl(src) || '/placeholder.svg'}
              alt={`${spot.title} photo ${i + 1}`}
              crossOrigin="anonymous"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="absolute left-0 top-0 z-10 w-full p-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full p-2 text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            aria-label="Go back"
          >
            <ArrowLeft className="h-7 w-7" />
          </Link>
        </div>

        <div className="absolute left-0 top-1/2 z-10 flex w-full -translate-y-1/2 items-center justify-between px-4">
          <button
            onClick={goPrev}
            className="grid h-12 w-12 place-items-center rounded-full bg-teal-400/90 text-white shadow-md"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            onClick={goNext}
            className="grid h-12 w-12 place-items-center rounded-full bg-teal-400/90 text-white shadow-md"
            aria-label="Next image"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>

        <BlurDrawer
          spot={spot}
          index={index}
          fullStars={fullStars}
          hasHalf={hasHalf}
          emptyStars={emptyStars}
          goTo={goTo}
          onOpenDrawer={() => setOpenDrawer(true)}
          slug={slug}
        />
      </div>

      <PlanDrawer
        open={openDrawer}
        onOpenChange={setOpenDrawer}
        spot={spot}
        router={router}
      />
    </>
  )
}

function PlanDrawer({
  open,
  onOpenChange,
  spot,
  router,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  spot: DbSpot
  router: ReturnType<typeof useRouter>
}) {
  const params = useSearchParams()
  const appendMode = params.get('append') === '1'
  const dayParam = Number(params.get('day') || '1')
  const safeDay =
    Number.isFinite(dayParam) && dayParam > 0 ? dayParam : 1
  const hasItinerary = !!getItinerary()
  const isAppending = appendMode || hasItinerary

  const pricePerNight = (spot.pricing as any)?.pricePerNight || 100

  const handlePrimary = useCallback(() => {
    if (isAppending) {
      appendSpot(
        {
          title: spot.title,
          image: getImageUrl(spot.images[0]),
          location: spot.location,
          rating: spot.rating,
          time: '09:00',
          pricePerNight,
          lat: spot.lat ?? undefined,
          lng: spot.lng ?? undefined,
        },
        safeDay
      )
      onOpenChange(false)
      router.push(`/planner/itinerary?activeDay=${safeDay}`)
      return
    }
    const url = `/planner/new?title=${encodeURIComponent(
      spot.title
    )}&image=${encodeURIComponent(
      getImageUrl(spot.images[0])
    )}&location=${encodeURIComponent(
      spot.location
    )}&price=${pricePerNight}&rating=${spot.rating}&time=09:00&lat=${
      spot.lat
    }&lng=${spot.lng}`
    onOpenChange(false)
    router.push(url)
  }, [
    isAppending,
    router,
    spot,
    onOpenChange,
    dayParam,
    pricePerNight,
  ])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[70vh] w-full rounded-t-3xl bg-white p-6 text-gray-900 sm:max-w-none"
      >
        <div className="flex h-full flex-col p-2">
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl font-bold text-gray-800">{`About ${spot.title}`}</SheetTitle>
            <SheetDescription className="text-gray-600">
              {spot.description}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-800">
              Pricing
            </h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 py-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <Plane className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      1 Night
                    </p>
                    <p className="text-gray-500">
                      {(spot.pricing as any)?.oneNight ||
                        'Price not available'}
                    </p>
                  </div>
                </div>
                <ChevronRightSmall className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <BedDouble className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      2 Nights
                    </p>
                    <p className="text-gray-500">
                      {(spot.pricing as any)?.twoNights ||
                        'Price not available'}
                    </p>
                  </div>
                </div>
                <ChevronRightSmall className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="mt-auto -mx-6 border-t bg-white px-6 pt-4">
            <button
              className="mb-1 w-full rounded-full bg-teal-400 py-4 font-bold text-white shadow hover:bg-teal-500"
              onClick={handlePrimary}
            >
              {isAppending ? 'Add to itinerary' : 'Plan trip'}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function BlurDrawer({
  spot,
  index,
  fullStars,
  hasHalf,
  emptyStars,
  goTo,
  onOpenDrawer,
  slug,
}: {
  spot: DbSpot
  index: number
  fullStars: number
  hasHalf: boolean
  emptyStars: number
  goTo: (i: number) => void
  onOpenDrawer: () => void
  slug: string
}) {
  const [overlayCollapsed, setOverlayCollapsed] = useState(false)
  const [buttonInteractive, setButtonInteractive] = useState(true)

  // Handle clicking the handle indicator to toggle collapsed state
  const handleHandleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (overlayCollapsed) {
        setOverlayCollapsed(false)
        // Disable button interaction briefly to prevent accidental clicks
        setButtonInteractive(false)
        setTimeout(() => {
          setButtonInteractive(true)
        }, 400) // Slightly longer than the animation
      } else {
        setOverlayCollapsed(true)
      }
    },
    [overlayCollapsed]
  )

  // Handle tap to restore overlay when collapsed (for the content area)
  const handleOverlayTap = useCallback(() => {
    if (overlayCollapsed) {
      setOverlayCollapsed(false)
      // Disable button interaction briefly to prevent accidental clicks
      setButtonInteractive(false)
      setTimeout(() => {
        setButtonInteractive(true)
      }, 400) // Slightly longer than the animation
    }
  }, [overlayCollapsed])

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-10"
      initial={false}
      animate={{
        y: overlayCollapsed ? 'calc(100% - 125px)' : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: overlayCollapsed ? 80 : 200,
        damping: overlayCollapsed ? 8 : 25,
        mass: 1.5,
        duration: overlayCollapsed ? 0.8 : 0.4,
      }}
      onClick={handleOverlayTap}
    >
      {/* Always visible handle and minimal container */}
      <div
        className={`rounded-t-3xl bg-black/30 backdrop-blur-sm transition-all duration-300 ${
          overlayCollapsed ? 'p-3' : 'p-6'
        }`}
      >
        {/* Down button indicator */}
        <div className="mb-4 flex justify-center">
          <button
            onClick={handleHandleClick}
            className="flex items-center justify-center rounded-full p-2 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            aria-label={
              overlayCollapsed ? 'Expand overlay' : 'Collapse overlay'
            }
          >
            <motion.div
              animate={{ rotate: overlayCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-5 w-5 text-white/70" />
            </motion.div>
          </button>
        </div>

        {/* Collapsed state shows minimal content */}
        {overlayCollapsed ? (
          <div className="text-center">
            <h1 className="text-lg font-bold truncate">
              {spot.title}
            </h1>
            <p className="text-xs text-gray-300 mt-1">
              Tap to expand
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex space-x-2">
                {spot.images.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to image ${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      goTo(i)
                    }}
                    className={`h-3 w-3 rounded-full transition ${
                      i === index
                        ? 'bg-teal-400'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>

            <h1 className="mb-2 text-4xl font-extrabold tracking-tight">
              {spot.title}
            </h1>
            <p className="mb-4 text-sm leading-relaxed text-gray-200">
              {spot.description}
            </p>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {Array.from({ length: fullStars }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400"
                    />
                  ))}
                  {hasHalf && (
                    <StarHalf className="h-5 w-5 fill-yellow-400" />
                  )}
                  {Array.from({ length: emptyStars }).map((_, i) => (
                    <Star
                      key={`e-${i}`}
                      className="h-5 w-5 opacity-30"
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm">
                  {spot.rating.toFixed(2)}
                </span>
                <span className="ml-2 text-sm text-gray-200">
                  ({spot.reviews} reviews)
                </span>
              </div>
              <Link
                href={`/spots/${slug}/see-more`}
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className="text-sm text-teal-400 hover:text-teal-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
              >
                See more
              </Link>
            </div>

            <button
              disabled={!buttonInteractive}
              onClick={(e) => {
                e.stopPropagation()
                if (buttonInteractive) {
                  onOpenDrawer()
                }
              }}
              className={`w-full rounded-full px-6 py-4 text-lg font-bold text-white shadow-md transition-all ${
                buttonInteractive
                  ? 'bg-teal-400 hover:bg-teal-400/90 cursor-pointer'
                  : 'bg-teal-400/50 cursor-not-allowed'
              }`}
            >
              Add to Plan
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}
