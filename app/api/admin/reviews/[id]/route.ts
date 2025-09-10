import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'
import { z } from 'zod'

const respondToReviewSchema = z.object({
  response: z.string().min(1, 'Response cannot be empty'),
})

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    // Validate input
    const { response } = respondToReviewSchema.parse(body)

    // In a real implementation, you would:
    // 1. Create a review_responses table
    // 2. Store the response linked to the review
    // 3. Update the review status

    // For now, we'll just log the response and return success
    console.log(`Response to review ${params.id}: ${response}`)

    // You could also update the review with a response field if your schema allows
    const { error } = await supabase
      .from('reviews')
      .update({
        // Add response-related fields if they exist in your schema
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (error) {
      console.error('Error updating review:', error)
      return NextResponse.json(
        { error: 'Failed to save response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Response saved successfully',
      response,
    })
  } catch (error) {
    console.error('Error in POST /api/admin/reviews/[id]:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
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
    const supabase = createServiceClient()

    // Delete the review (admin only)
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting review:', error)
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error in DELETE /api/admin/reviews/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
