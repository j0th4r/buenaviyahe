import { createServiceClient } from '@/lib/supabase/config'
import { NextRequest, NextResponse } from 'next/server'
import { requireBusinessOwner } from '@/lib/auth/admin'

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
    // Verify business owner authentication
    const user = await requireBusinessOwner()

    const supabase = createServiceClient()

    // Get specific spot owned by this business owner
    const { data: spot, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', params.id)
      .eq('owner_id', user.id) // Security: only owner can access
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Spot not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ spot })
  } catch (error) {
    console.error('Error fetching business spot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify business owner authentication
    const user = await requireBusinessOwner()

    const body = await request.json()
    const supabase = createServiceClient()

    // Update spot owned by this business owner
    const { data: spot, error } = await supabase
      .from('spots')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('owner_id', user.id) // Security: only owner can update
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Spot not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ spot })
  } catch (error) {
    console.error('Error updating business spot:', error)
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
    // Verify business owner authentication
    const user = await requireBusinessOwner()

    const supabase = createServiceClient()

    // Delete spot owned by this business owner
    const { error } = await supabase
      .from('spots')
      .delete()
      .eq('id', params.id)
      .eq('owner_id', user.id) // Security: only owner can delete

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Spot deleted successfully' })
  } catch (error) {
    console.error('Error deleting business spot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







































