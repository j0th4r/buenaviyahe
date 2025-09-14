import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'
import { requireAdminAPI } from '@/lib/auth/admin'

export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    const adminUser = await requireAdminAPI(request)

    // Use service client for database operations
    const supabase = createServiceClient()

    // Get the request body
    const body = await request.json()
    const { userId, newRole } = body

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'User ID and new role are required' },
        { status: 400 }
      )
    }

    if (!['user', 'business_owner', 'admin'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Prevent changing admin roles (for safety)
    if (newRole === 'admin') {
      return NextResponse.json(
        {
          error:
            'Cannot elevate users to admin role via this endpoint',
        },
        { status: 403 }
      )
    }

    // Update the user role
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Log the role change
    console.log(
      `User ${userId} role updated to ${newRole} by admin ${adminUser.id}`
    )

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User role updated to ${newRole} successfully`,
    })
  } catch (error) {
    console.error('Error in user role update:', error)

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
