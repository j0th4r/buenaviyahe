import { createServiceClient } from '@/lib/supabase/config'
import { NextRequest, NextResponse } from 'next/server'
import { requireBusinessOwner } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  try {
    // Verify business owner authentication
    const user = await requireBusinessOwner()

    const supabase = createServiceClient()

    // First get all spots owned by this business owner
    const { data: spots } = await supabase
      .from('spots')
      .select('id')
      .eq('owner_id', user.id)

    if (!spots || spots.length === 0) {
      return NextResponse.json({ reviews: [] })
    }

    // Then get all reviews for those spots
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        spots!inner(title, slug)
      `
      )
      .in(
        'spot_id',
        spots.map((spot) => spot.id)
      )
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ reviews: reviews || [] })
  } catch (error) {
    console.error('Error fetching business reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

