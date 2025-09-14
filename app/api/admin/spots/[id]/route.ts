import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'
import { requireAdminAPI } from '@/lib/auth/admin'
import { z } from 'zod'

const updateSpotSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  pricing: z
    .object({
      type: z.enum(['free', 'paid', 'varies']),
      adult: z.number().optional(),
      child: z.number().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check admin authentication
    await requireAdminAPI(request)
    const supabase = createServiceClient()

    const { data: spot, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Spot not found' },
          { status: 404 }
        )
      }

      console.error('Error fetching spot:', error)
      return NextResponse.json(
        { error: 'Failed to fetch spot' },
        { status: 500 }
      )
    }

    return NextResponse.json(spot)
  } catch (error) {
    console.error('Error in GET /api/admin/spots/[id]:', error)

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

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check admin authentication
    await requireAdminAPI(request)
    const supabase = createServiceClient()
    const body = await request.json()

    // Validate input
    const validatedData = updateSpotSchema.parse(body)

    // Prevent slug changes since slug is used as ID
    if (validatedData.slug && validatedData.slug !== params.id) {
      return NextResponse.json(
        {
          error:
            'Cannot change slug - it is used as the record ID. Create a new listing instead.',
        },
        { status: 400 }
      )
    }

    // Update the spot
    const { data: spot, error } = await supabase
      .from('spots')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Spot not found' },
          { status: 404 }
        )
      }

      console.error('Error updating spot:', error)
      return NextResponse.json(
        { error: 'Failed to update spot' },
        { status: 500 }
      )
    }

    return NextResponse.json(spot)
  } catch (error) {
    console.error('Error in PATCH /api/admin/spots/[id]:', error)

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
        { error: 'Invalid input', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check admin authentication
    await requireAdminAPI(request)
    const supabase = createServiceClient()

    // Delete the spot
    const { error } = await supabase
      .from('spots')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting spot:', error)
      return NextResponse.json(
        { error: 'Failed to delete spot' },
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error in DELETE /api/admin/spots/[id]:', error)

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
