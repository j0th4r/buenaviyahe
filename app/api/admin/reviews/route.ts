import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') // 'pending', 'responded', 'all'
    const rating = searchParams.get('rating')

    let query = supabase
      .from('reviews')
      .select(
        `
        *,
        spots (
          id,
          title,
          slug,
          images
        )
      `
      )
      .order('created_at', { ascending: false })

    // Apply rating filter
    if (rating && rating !== 'all') {
      query = query.eq('rating', parseInt(rating))
    }

    // Apply status filter (simplified logic - in real app, you'd track response status)
    if (filter === 'pending') {
      const weekAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString()
      query = query.gte('created_at', weekAgo)
    }

    const { data: reviews, error } = await query

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json(reviews || [])
  } catch (error) {
    console.error('Error in GET /api/admin/reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
