"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CheckCircle2, Share2, ArrowRight, Calendar, MapPin } from "lucide-react"
import { getItinerary, type Itinerary, getNights } from "@/lib/itinerary-store"

export default function SuccessPage() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  useEffect(() => {
    const currentItinerary = getItinerary()
    setItinerary(currentItinerary)
  }, [])
  
  const nights = getNights(itinerary)
  const title = itinerary?.title || "Your trip"

  return (
    <div className="bg-white">
      <div className="mx-auto min-h-[100dvh] max-w-md px-4 py-10">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-16 w-16 text-teal-500" />
          <h1 className="mt-4 text-2xl font-bold">Booking Confirmed</h1>
          <p className="mt-2 text-gray-600">
            {title} • {nights} night{nights === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/plans"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-500 py-3 font-semibold text-white hover:bg-teal-600"
          >
            <Calendar className="h-5 w-5" />
            View My Plans
          </Link>
          <Link
            href="/planner/new"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Create Another Plan
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#B8860B] py-3 font-semibold text-white hover:bg-[#B8860B]/80"
          >
            <MapPin className="h-5 w-5" />
            Explore Spots
          </Link>
        </div>
      </div>
    </div>
  )
}
