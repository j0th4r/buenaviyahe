import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'
import { requireAdminAPI } from '@/lib/auth/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    console.log('Authenticating admin user for spot status update...')
    const adminUser = await requireAdminAPI(request)
    console.log(
      'Admin authentication successful:',
      adminUser.profile.name
    )

    // Await params to get the id
    const { id } = await params

    // Use service client for database operations
    const supabase = createServiceClient()

    // Get the new status from request body
    const body = await request.json()
    const { status, notes } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update the spot status
    const { data: spot, error } = await supabase
      .from('spots')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating spot status:', error)
      return NextResponse.json(
        { error: 'Failed to update spot status' },
        { status: 500 }
      )
    }

    // Log the status change (optional - you could create an audit log table)
    console.log(
      `Spot ${id} status updated to ${status} by admin ${adminUser.id}`
    )

    // If approved, you might want to notify the business owner
    if (status === 'approved' && spot.owner_id) {
      // TODO: Send notification to business owner
      console.log(
        `Notification would be sent to owner ${spot.owner_id}`
      )
    }

    return NextResponse.json({
      success: true,
      spot,
      message: `Spot ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
    })
  } catch (error) {
    console.error('Error in spot status update:', error)

    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      if (error.message === 'Admin privileges required') {
        return NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        )
      }
      if (error.message === 'Profile not found') {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
