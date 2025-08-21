"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Star, StarHalf, Clock, Trash2, Pencil } from "lucide-react"
import { format, addDays, differenceInCalendarDays, parseISO, isValid } from "date-fns"
import { getItinerary, type Itinerary, removeSpot, updateSpotTime, getDaysCount, updateItinerary } from "@/lib/itinerary-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Editable = { spotId: string; time: string; day: number } | null

export default function ItineraryPage() {
  const search = useSearchParams()
  const router = useRouter()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [activeDay, setActiveDay] = useState<number>(Number(search.get("activeDay") || "1"))
  const [isUpdating, setIsUpdating] = useState(false)

  const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
  const [editing, setEditing] = useState<Editable>(null)

  useEffect(() => {
    const it = getItinerary()
    setItinerary(it)
    // Ensure activeDay within range
    const initial = Number(search.get("activeDay") || "1")
    setActiveDay(initial > 0 ? initial : 1)
  }, [search])

  // Build days for chip labels
  const fromParam = itinerary?.start || search.get("from") || undefined
  const toParam = itinerary?.end || search.get("to") || undefined
  const from = fromParam ? parseISO(fromParam) : undefined
  const to = toParam ? parseISO(toParam) : undefined

  const days = useMemo(() => {
    if (from && to && isValid(from) && isValid(to) && from <= to) {
      const len = differenceInCalendarDays(to, from) + 1
      return Array.from({ length: len }, (_, i) => addDays(from, i))
    }
    // Use static year to prevent hydration mismatches due to timezone differences
    const year = 2024
    return [new Date(year, 6, 21), new Date(year, 6, 22), new Date(year, 6, 23)]
  }, [from, to])

  const totalDays = itinerary ? getDaysCount(itinerary) : days.length
  const dayList = Array.from({ length: totalDays }, (_, i) => i + 1)

  useEffect(() => {
    setActiveDay((prev) => clamp(prev, 1, Math.max(1, totalDays)))
  }, [totalDays])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setActiveDay((d) => clamp(d - 1, 1, totalDays))
      if (e.key === "ArrowRight") setActiveDay((d) => clamp(d + 1, 1, totalDays))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [totalDays])

  const spotsForActiveDay = useMemo(() => itinerary?.days?.[activeDay] ?? [], [itinerary, activeDay])

  const handleRemove = async (spotId: string) => {
    const next = removeSpot(spotId, activeDay)
    if (next) {
      setItinerary(next)
      // Sync to Supabase
      try {
        setIsUpdating(true)
        await updateItinerary(next)
      } catch (error) {
        console.warn('Failed to sync removal to Supabase:', error)
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleEditTime = (spotId: string, current?: string) => {
    setEditing({ spotId, time: current || "09:00", day: activeDay })
  }

  const confirmEdit = async () => {
    if (!editing) return
    const next = updateSpotTime(editing.spotId, editing.time, editing.day)
    if (next) {
      setItinerary(next)
      // Sync to Supabase
      try {
        setIsUpdating(true)
        await updateItinerary(next)
      } catch (error) {
        console.warn('Failed to sync time update to Supabase:', error)
      } finally {
        setIsUpdating(false)
      }
    }
    setEditing(null)
  }

  // Ratings component
  const Rating = ({ value }: { value: number }) => {
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
          <Star key={`e-${i}`} className="h-5 w-5 text-gray-400" />
        ))}
      </div>
    )
  }

  const countForDay = (dIndex: number) => itinerary?.days?.[dIndex]?.length ?? 0

  // Check if all days have at least one activity
  const allDaysHaveActivities = useMemo(() => {
    if (!itinerary) return false

    for (let day = 1; day <= totalDays; day++) {
      if (countForDay(day) === 0) {
        return false
      }
    }
    return true
  }, [itinerary, totalDays, countForDay])

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      <h1 className="mb-8 text-center text-2xl font-bold">New Plan</h1>
      
      {isUpdating && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          Syncing changes...
        </div>
      )}

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
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${active ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {`Day ${dIndex}`} {days[dIndex - 1] ? `• ${format(days[dIndex - 1], "MMM d")}` : ""}
              {count > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-500 px-1 text-xs font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <h2 className="mb-4 text-lg font-semibold">Travel Plan</h2>

      <div className="space-y-4">
        {spotsForActiveDay.length ? (
          spotsForActiveDay.map((s) => (
            <div key={s.id} className="relative overflow-hidden rounded-xl shadow-lg">
              <img
                src={s.image || "/placeholder.svg?height=160&width=640&query=scenic%20destination"}
                alt={s.title}
                className="h-32 w-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-black/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white text-lg font-semibold">{s.title}</h3>
                    <div className="mt-1">
                      <Rating value={s.rating ?? 4.5} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditTime(s.id, s.time)}
                      className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800 hover:bg-white"
                    >
                      <Clock className="h-4 w-4 text-gray-700" />
                      {s.time ?? "Set time"}
                      <Pencil className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleRemove(s.id)}
                      disabled={isUpdating}
                      className="inline-flex items-center rounded-full bg-red-500/90 p-2 text-white hover:bg-red-600 disabled:opacity-50"
                      aria-label={`Remove ${s.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="grid place-items-center rounded-xl border border-dashed p-8 text-center text-gray-500">
            <p className="mb-3">No activities for this day yet.</p>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <a
          href={`/?append=1&day=${activeDay}`}
          className="block w-full rounded-full bg-teal-400 py-4 text-center text-lg font-semibold text-white shadow-md transition duration-300 hover:bg-teal-500"
        >
          Add activity/spot
        </a>
        <button
          onClick={() => router.push("/planner/confirm")}
          disabled={!allDaysHaveActivities || isUpdating}
          className={`w-full rounded-full py-4 text-lg font-semibold text-white shadow-md transition duration-300 ${allDaysHaveActivities && !isUpdating
              ? "bg-teal-400 hover:bg-teal-500"
              : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          Confirm Itinerary
        </button>
      </div>

      {/* Edit Time Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit time</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Time</label>
            <Input
              type="time"
              value={editing?.time ?? ""}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, time: e.target.value } : prev))}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={confirmEdit} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
