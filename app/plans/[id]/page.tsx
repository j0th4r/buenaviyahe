'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Star,
  StarHalf,
  Clock,
  ArrowLeft,
  Calendar,
  MapPin,
  Map,
} from 'lucide-react'
import {
  format,
  addDays,
  differenceInCalendarDays,
  parseISO,
  isValid,
} from 'date-fns'
import { getItinerary as getItineraryFromAPI } from '@/lib/api'
import type { Itinerary } from '@/lib/itinerary-store'

export default function PlanDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState<number>(1)

  const itineraryId = params.id as string

  useEffect(() => {
    const loadItinerary = async () => {
      try {
        setLoading(true)
        const data = await getItineraryFromAPI(itineraryId)
        if (data) {
          setItinerary(data)
        } else {
          setError('Itinerary not found')
        }
      } catch (err) {
        console.error('Failed to load itinerary:', err)
        setError('Failed to load itinerary')
      } finally {
        setLoading(false)
      }
    }

    if (itineraryId) {
      loadItinerary()
    }
  }, [itineraryId])

  // Build days for chip labels
  const fromParam = itinerary?.start
  const toParam = itinerary?.end
  const from = fromParam ? parseISO(fromParam) : undefined
  const to = toParam ? parseISO(toParam) : undefined

  const days = useMemo(() => {
    if (from && to && isValid(from) && isValid(to) && from <= to) {
      const len = differenceInCalendarDays(to, from) + 1
      return Array.from({ length: len }, (_, i) => addDays(from, i))
    }
    return []
  }, [from, to])

  const totalDays = itinerary?.days
    ? Object.keys(itinerary.days).length
    : days.length
  const dayList = Array.from({ length: totalDays }, (_, i) => i + 1)

  const spotsForActiveDay = useMemo(
    () => itinerary?.days?.[activeDay] ?? [],
    [itinerary, activeDay]
  )

  const countForDay = (dIndex: number) =>
    itinerary?.days?.[dIndex]?.length ?? 0

  // Ratings component
  const Rating = ({ value }: { value: number }) => {
    const full = Math.floor(value)
    const half = value % 1 >= 0.5
    const empty = Math.max(0, 5 - full - (half ? 1 : 0))
    return (
      <div className="flex items-center">
        {Array.from({ length: full }).map((_, i) => (
          <Star
            key={`f-${i}`}
            className="h-5 w-5 text-yellow-400 fill-yellow-400"
          />
        ))}
        {half && (
          <StarHalf className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e-${i}`} className="h-5 w-5 text-gray-400" />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
          <span className="ml-3 text-lg text-gray-600">
            Loading plan details...
          </span>
        </div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <button
            aria-label="Go back"
            onClick={() => router.back()}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Plan Details</h1>
          <div className="w-6" />
        </header>

        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Plan not found'}
          </h3>
          <p className="text-gray-500 mb-6">
            We couldn't find the plan you're looking for.
          </p>
          <button
            onClick={() => router.push('/plans')}
            className="px-6 py-3 bg-
            -500 text-white rounded-full hover:bg-teal-600 transition-colors"
          >
            Back to Plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <button
          aria-label="Go back"
          onClick={() => router.back()}
          className="rounded-full p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">
          {itinerary.title || 'Untitled Plan'}
        </h1>
        <div className="w-6" />
      </header>

      {/* Day Tabs */}
      <div
        className="mb-8 flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label="Travel plan days"
      >
        {dayList.map((dIndex) => {
          const active = activeDay === dIndex
          const count = countForDay(dIndex)
          return (
            <button
              key={dIndex}
              onClick={() => setActiveDay(dIndex)}
              role="tab"
              aria-selected={active}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                active
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {`Day ${dIndex}`}{' '}
              {days[dIndex - 1]
                ? `• ${format(days[dIndex - 1], 'MMM d')}`
                : ''}
              {count > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-500 px-1 text-xs font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <h3 className="mb-4 text-lg font-semibold">
        Day {activeDay} Activities
      </h3>

      <div className="space-y-4">
        {spotsForActiveDay.length ? (
          spotsForActiveDay.map((s, index) => (
            <div
              key={`${s.id}-${index}`}
              className="relative overflow-hidden rounded-xl shadow-lg"
            >
              <img
                src={
                  s.image ||
                  '/placeholder.svg?height=160&width=640&query=scenic%20destination'
                }
                alt={s.title}
                className="h-32 w-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-black/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white text-lg font-semibold">
                      {s.title}
                    </h4>
                    <div className="mt-1">
                      <Rating value={s.rating ?? 4.5} />
                    </div>
                    {s.location && (
                      <p className="text-white/90 text-sm mt-1">
                        {s.location}
                      </p>
                    )}
                  </div>
                  {s.time && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800">
                      <Clock className="h-4 w-4 text-gray-700" />
                      {s.time}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="grid place-items-center rounded-xl border border-dashed p-8 text-center text-gray-500">
            <Calendar className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-lg font-medium">
              No activities for this day
            </p>
            <p className="text-sm">
              Activities will appear here once added to the plan.
            </p>
          </div>
        )}
      </div>

      {/* View Itinerary Map Button */}
      {spotsForActiveDay.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() =>
              router.push(
                `/plans/${itineraryId}/itinerary-map?day=${activeDay}`
              )
            }
            className="w-full flex items-center justify-center gap-3 bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors shadow-md"
          >
            <Map className="h-5 w-5" />
            View Whole Itinerary
          </button>
        </div>
      )}
    </div>
  )
}
