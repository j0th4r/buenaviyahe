import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createServerClient } from '@/lib/supabase/config'

// Schema for a single spot in the itinerary
const spotSchema = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string(),
  lat: z.number(),
  lng: z.number(),
  rating: z.number(),
  image: z.string().optional(),
  pricePerNight: z.number().optional(),
  time: z.string().optional(),
  day: z.number(),
})

// Schema for the request body
const createItinerarySchema = z.object({
  title: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  daySpots: z
    .record(z.string(), z.array(spotSchema))
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one day with spots is required',
    }),
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const json = await request.json()
    const parsed = createItinerarySchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { title, startDate, endDate, daySpots } = parsed.data

    // Format spots into the days structure, removing the 'day' field from each spot
    const days: Record<string, any[]> = {}
    for (const [dayKey, spots] of Object.entries(daySpots)) {
      days[dayKey] = spots.map((spot) => ({
        id: spot.id,
        title: spot.title,
        location: spot.location,
        lat: spot.lat,
        lng: spot.lng,
        rating: spot.rating,
        time: spot.time ?? '09:00',
        image: spot.image,
        pricePerNight: spot.pricePerNight,
      }))
    }

    // Use current date as default for start_date if not provided
    const today = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
    const defaultEndDate = endDate ?? startDate ?? today

    // Create itinerary in database
    const { data: itinerary, error: createError } = await supabase
      .from('itineraries')
      .insert({
        title: title ?? 'My Itinerary',
        start_date: startDate ?? today,
        end_date: defaultEndDate,
        days,
        user_id: user.id,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating itinerary:', createError)
      return NextResponse.json(
        { error: 'Failed to create itinerary' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      itinerary: {
        id: itinerary.id,
        title: itinerary.title,
        startDate: itinerary.start_date,
        endDate: itinerary.end_date,
      },
    })
  } catch (error) {
    console.error('Itinerary creation error:', error)

    return NextResponse.json(
      {
        error: 'Failed to create itinerary',
        details:
          process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
