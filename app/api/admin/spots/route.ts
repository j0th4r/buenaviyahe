import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'
import { requireAdminAPI } from '@/lib/auth/admin'
import { z } from 'zod'

const createSpotSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  pricing: z.object({
    type: z.enum(['free', 'paid', 'varies']),
    adult: z.number().optional(),
    child: z.number().optional(),
    notes: z.string().optional(),
  }),
  lat: z.number().optional(),
  lng: z.number().optional(),
  rating: z.number().default(0),
  reviews: z.number().default(0),
})

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdminAPI(request)
    const supabase = createServiceClient()
    const body = await request.json()

    // Validate input
    const validatedData = createSpotSchema.parse(body)

    // Check if slug/ID is unique (since ID will be the same as slug)
    const { data: existingSpot } = await supabase
      .from('spots')
      .select('id')
      .eq('id', validatedData.slug)
      .single()

    if (existingSpot) {
      return NextResponse.json(
        { error: 'Slug already exists (slug is used as ID)' },
        { status: 400 }
      )
    }

    // Use slug as the ID
    const id = validatedData.slug

    // Create the spot
    const { data: spot, error } = await supabase
      .from('spots')
      .insert({
        id,
        ...validatedData,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating spot:', error)
      return NextResponse.json(
        { error: 'Failed to create spot' },
        { status: 500 }
      )
    }

    return NextResponse.json(spot, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/spots:', error)

    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      if (error.message === 'Admin privileges required') {
        return NextResponse.json(
          { error: 'Admin privileges required' },
          { status: 403 }
        )
      }
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdminAPI(request)
    const supabase = createServiceClient()

    const { data: spots, error } = await supabase
      .from('spots')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching spots:', error)
      return NextResponse.json(
        { error: 'Failed to fetch spots' },
        { status: 500 }
      )
    }

    return NextResponse.json(spots)
  } catch (error) {
    console.error('Error in GET /api/admin/spots:', error)

    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      if (error.message === 'Admin privileges required') {
        return NextResponse.json(
          { error: 'Admin privileges required' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
