"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { getItinerary, type Itinerary, getNights, fallbackPricePerNight, confirmBooking } from "@/lib/itinerary-store"
import { Star, StarHalf, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

type SpotView = {
  id: string
  title: string
  image?: string
  rating?: number
  pricePerNight?: number
}

function Rating({ value = 4.5 }: { value?: number }) {
  const full = Math.floor(value)
  const half = value % 1 >= 0.5
  const empty = Math.max(0, 5 - full - (half ? 1 : 0))
  return (
    <div className="flex items-center">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
      ))}
      {half && <StarHalf className="h-5 w-5 text-yellow-400 fill-yellow-400" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="h-5 w-5 text-gray-300" />
      ))}
    </div>
  )
}

export default function ConfirmPlanPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    setItinerary(getItinerary())
  }, [])

  const nights = useMemo(() => getNights(itinerary), [itinerary])

  const spotsByDay = useMemo(() => {
    if (!itinerary?.days) return []
    
    return Object.entries(itinerary.days).map(([dayKey, daySpots]) => ({
      day: `Day ${dayKey}`,
      spots: daySpots.map((s) => ({
        id: s.id,
        title: s.title,
        image: s.image,
        rating: s.rating,
        pricePerNight: s.pricePerNight,
      }))
    }))
  }, [itinerary])

  // Flatten spots for costs calculation (with unique tracking)
  const uniqueSpots: SpotView[] = useMemo(() => {
    const uniqueMap = new Map<string, SpotView>()
    
    spotsByDay.forEach(({ spots }) => {
      spots.forEach(spot => {
        if (!uniqueMap.has(spot.id)) {
          uniqueMap.set(spot.id, spot)
        }
      })
    })
    
    return Array.from(uniqueMap.values())
  }, [spotsByDay])

  const costs = useMemo(() => {
    const items = uniqueSpots.map((s) => {
      const p = s.pricePerNight ?? fallbackPricePerNight(s.title)
      return {
        title: s.title,
        unit: p,
        nights,
        amount: p * nights,
      }
    })
    const subtotal = items.reduce((acc, i) => acc + i.amount, 0)
    const taxes = Math.round(subtotal * 0.12) // 12%
    const fees = Math.round(subtotal * 0.05) // 5%
    const total = subtotal + taxes + fees
    return { items, subtotal, taxes, fees, total }
  }, [uniqueSpots, nights])

  const handleConfirmBooking = async () => {
    if (!itinerary) return
    
    setIsConfirming(true)
    try {
      // Save the itinerary to Supabase and clear localStorage
      await confirmBooking()
      router.push("/planner/success")
    } catch (error) {
      console.error('Failed to confirm booking:', error)
      // Show error message to user
      alert('Failed to save itinerary. Please try again.')
    } finally {
      setIsConfirming(false)
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <button aria-label="Go back" onClick={() => router.back()} className="rounded-full p-1 hover:bg-gray-100">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Confirm Plan</h1>
          <div className="w-6" />
        </header>
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
          No itinerary found. Create a plan first.
          <a href="/" className="mt-4 block font-semibold text-teal-600 underline">
            Explore spots
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="mx-auto min-h-[100dvh] max-w-md pb-28">
        <header className="flex items-center justify-between p-4 bg-white sticky top-0 z-10">
          <button
            aria-label="Go back"
            className="text-gray-800 rounded-full p-1 hover:bg-gray-100"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Confirm Plan</h1>
          <div className="w-6" />
        </header>

        <main className="p-4">
          {/* Travel Plan */}
          <section className="mb-8">
            <div className="mb-1 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Travel Plan</h2>
              <span className="text-sm text-gray-500">
                {nights} night{nights === 1 ? "" : "s"}
              </span>
            </div>
            <div className="space-y-6">
              {spotsByDay.length ? (
                spotsByDay.map(({ day, spots }) => (
                  <div key={day} className="space-y-4">
                    <h3 className="text-base font-medium text-gray-600 capitalize">
                      {day.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className="space-y-4">
                      {spots.map((s, index) => (
                        <article key={`${day}-${s.id}-${index}`} className="relative h-32 overflow-hidden rounded-lg">
                          <img
                            src={s.image || "/placeholder.svg?height=128&width=512&query=travel%20destination"}
                            alt={`${s.title} photo`}
                            className="h-full w-full object-cover"
                            crossOrigin="anonymous"
                          />
                          <div className="absolute inset-0 flex flex-col justify-end bg-black/35 p-4">
                            <h4 className="text-lg font-bold text-white">{s.title}</h4>
                            <div className="mt-1">
                              <Rating value={s.rating ?? 4.5} />
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-gray-500">No spots added yet.</div>
              )}
            </div>
          </section>

          {/* Travel Costs */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Travel Costs</h2>
            <div className="space-y-3 text-gray-700">
              {costs.items.map((row, idx) => (
                <div key={`${row.title}-${idx}`} className="flex items-center justify-between text-sm">
                  <span className="truncate">{row.title}</span>
                  <span className="mx-2 flex-grow border-b border-dotted border-gray-300" aria-hidden="true" />
                  <span className="font-medium text-teal-600">{`₱${row.amount.toLocaleString("en-PH")}`}</span>
                </div>
              ))}

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="mx-2 flex-grow border-b border-dotted border-gray-300" aria-hidden="true" />
                <span className="text-gray-900">{`₱${costs.subtotal.toLocaleString("en-PH")}`}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Taxes (10%)</span>
                <span className="mx-2 flex-grow border-b border-dotted border-gray-300" aria-hidden="true" />
                <span className="text-gray-900">{`₱${costs.taxes.toLocaleString("en-PH")}`}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Service Fee (5%)</span>
                <span className="mx-2 flex-grow border-b border-dotted border-gray-300" aria-hidden="true" />
                <span className="text-gray-900">{`₱${costs.fees.toLocaleString("en-PH")}`}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-bold">Total</span>
                <span className="mx-2 flex-grow border-b border-dotted border-gray-300" aria-hidden="true" />
                <span className="font-bold text-teal-600">{`₱${costs.total.toLocaleString("en-PH")}`}</span>
              </div>
            </div>
          </section>
        </main>

        {/* Bottom CTA */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-md p-4">
            <button
              className="w-full rounded-full bg-teal-400 py-4 text-lg font-bold text-white shadow-lg hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirmBooking}
              disabled={isConfirming}
            >
              {isConfirming ? 'Saving...' : 'Confirm Book'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
