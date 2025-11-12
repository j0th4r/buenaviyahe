import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'
import { requireBusinessOwner } from '@/lib/auth/admin'

interface RouteParams {
  params: {
    id: string
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

    // First, verify that the review belongs to a spot owned by this business owner
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('spot_id, spots!inner(owner_id)')
      .eq('id', params.id)
      .single()

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if the spot is owned by this business owner
    const spot = review.spots as { owner_id: string } | null
    if (!spot || spot.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete reviews for your own spots' },
        { status: 403 }
      )
    }

    // Delete the review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting review:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/business/reviews/[id]:', error)

    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      if (error.message === 'Business owner privileges required') {
        return NextResponse.json(
          { error: 'Business owner privileges required' },
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

