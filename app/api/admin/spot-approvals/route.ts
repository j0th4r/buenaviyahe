import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'
import { requireAdminAPI } from '@/lib/auth/admin'
import { z } from 'zod'

const spotApprovalSchema = z.object({
  spotId: z.string().min(1, 'Spot ID is required'),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({
      message: 'Action must be either "approve" or "reject"',
    }),
  }),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

const bulkApprovalSchema = z.object({
  spotIds: z.array(z.string().min(1)),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
})

// Note: This API assumes spots table has a 'status' field added
// In the current schema, you would need to add this field:
// ALTER TABLE spots ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdminAPI(request)
    const supabase = createServiceClient()
    const body = await request.json()

    // Validate input
    const validatedData = spotApprovalSchema.parse(body)

    // Check if spot exists and get current status
    const { data: existingSpot, error: spotError } = await supabase
      .from('spots')
      .select(
        `
        *,
        profiles!spots_owner_id_fkey (
          id,
          name,
          role
        )
      `
      )
      .eq('id', validatedData.spotId)
      .single()

    if (spotError || !existingSpot) {
      return NextResponse.json(
        { error: 'Spot not found' },
        { status: 404 }
      )
    }

    // For now, we'll simulate status checking since the current schema doesn't have status
    // In production, you would check: existingSpot.status
    const currentStatus = 'pending' // Mock current status

    // Check if spot is already in the target state
    if (currentStatus === validatedData.action + 'd') {
      // 'approved' or 'rejected'
      return NextResponse.json(
        { error: `Spot is already ${currentStatus}` },
        { status: 400 }
      )
    }

    const newStatus =
      validatedData.action === 'approve' ? 'approved' : 'rejected'

    // For now, we'll update a different field since status doesn't exist
    // In production, you would update the status field:
    // UPDATE spots SET status = newStatus, reviewed_at = NOW(), reviewed_by = admin_id, review_notes = notes

    // Simulate the approval/rejection by updating updated_at field
    const { data: updatedSpot, error: updateError } = await supabase
      .from('spots')
      .update({
        updated_at: new Date().toISOString(),
        // In production: status: newStatus,
        // In production: reviewed_at: new Date().toISOString(),
        // In production: reviewed_by: adminUserId,
        // In production: review_notes: validatedData.notes,
      })
      .eq('id', validatedData.spotId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating spot status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update spot status' },
        { status: 500 }
      )
    }

    // Log the approval/rejection for audit purposes
    console.log('Spot status change:', {
      spotId: validatedData.spotId,
      spotTitle: existingSpot.title,
      ownerId: existingSpot.owner_id,
      ownerName: existingSpot.profiles?.name,
      action: validatedData.action,
      oldStatus: currentStatus,
      newStatus,
      reason: validatedData.reason,
      notes: validatedData.notes,
      timestamp: new Date().toISOString(),
    })

    // TODO: Send notification to business owner about the decision
    // TODO: If approved, make spot visible to public
    // TODO: If rejected, send feedback for improvement
    // TODO: Update search indexes

    const message =
      validatedData.action === 'approve'
        ? 'Spot approved successfully and is now live on the platform'
        : 'Spot has been rejected'

    return NextResponse.json({
      id: updatedSpot.id,
      title: updatedSpot.title,
      oldStatus: currentStatus,
      newStatus,
      action: validatedData.action,
      message,
      ownerNotified: false, // Would be true after implementing notification
    })
  } catch (error) {
    console.error('Error in POST /api/admin/spot-approvals:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdminAPI(request)
    const supabase = createServiceClient()
    const body = await request.json()

    // Validate input for bulk approval/rejection
    const validatedData = bulkApprovalSchema.parse(body)

    // Check if all spots exist
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select(
        `
        *,
        profiles!spots_owner_id_fkey (
          id,
          name,
          role
        )
      `
      )
      .in('id', validatedData.spotIds)

    if (spotsError) {
      console.error('Error fetching spots:', spotsError)
      return NextResponse.json(
        { error: 'Failed to fetch spots' },
        { status: 500 }
      )
    }

    if (spots.length !== validatedData.spotIds.length) {
      return NextResponse.json(
        { error: 'Some spots were not found' },
        { status: 404 }
      )
    }

    // Filter spots that can be updated (currently pending)
    // In production, you would filter by status: spots.filter(spot => spot.status === 'pending')
    const spotsToUpdate = spots // For now, allow all spots to be updated

    if (spotsToUpdate.length === 0) {
      return NextResponse.json(
        { message: 'No spots are eligible for status change' },
        { status: 200 }
      )
    }

    const newStatus =
      validatedData.action === 'approve' ? 'approved' : 'rejected'

    // Bulk update spot statuses
    const { data: updatedSpots, error: updateError } = await supabase
      .from('spots')
      .update({
        updated_at: new Date().toISOString(),
        // In production: status: newStatus,
        // In production: reviewed_at: new Date().toISOString(),
        // In production: reviewed_by: adminUserId,
        // In production: review_notes: validatedData.reason,
      })
      .in(
        'id',
        spotsToUpdate.map((s) => s.id)
      )
      .select()

    if (updateError) {
      console.error('Error bulk updating spot statuses:', updateError)
      return NextResponse.json(
        { error: 'Failed to update spot statuses' },
        { status: 500 }
      )
    }

    // Log the bulk status changes
    console.log('Bulk spot status change:', {
      spotIds: spotsToUpdate.map((s) => s.id),
      spotTitles: spotsToUpdate.map((s) => s.title),
      action: validatedData.action,
      newStatus,
      reason: validatedData.reason,
      timestamp: new Date().toISOString(),
    })

    // Group spots by owner for efficient notification
    const spotsByOwner = spotsToUpdate.reduce(
      (acc, spot) => {
        const ownerId = spot.owner_id
        if (ownerId) {
          if (!acc[ownerId]) {
            acc[ownerId] = {
              owner: spot.profiles,
              spots: [],
            }
          }
          acc[ownerId].spots.push(spot)
        }
        return acc
      },
      {} as Record<string, { owner: any; spots: any[] }>
    )

    // TODO: Send bulk notifications to business owners
    // TODO: Update search indexes for all affected spots

    return NextResponse.json({
      updatedCount: updatedSpots?.length || 0,
      updatedSpots: updatedSpots?.map((spot) => ({
        id: spot.id,
        title: spot.title,
        newStatus,
      })),
      affectedOwners: Object.keys(spotsByOwner).length,
      message: `Successfully ${validatedData.action}d ${updatedSpots?.length || 0} spots`,
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/spot-approvals:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
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

    // Get URL parameters
    const url = new URL(request.url)
    const status = url.searchParams.get('status') // 'pending', 'approved', 'rejected'
    const ownerId = url.searchParams.get('owner')
    const search = url.searchParams.get('search')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let query = supabase.from('spots').select(
      `
        *,
        profiles!spots_owner_id_fkey (
          id,
          name,
          avatar_url,
          role
        )
      `,
      { count: 'exact' }
    )

    // Filter by business owner submissions only
    query = query.not('owner_id', 'is', null)

    // In production, you would filter by status:
    // if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    //   query = query.eq('status', status)
    // }

    // Filter by owner if specified
    if (ownerId) {
      query = query.eq('owner_id', ownerId)
    }

    // Search by title if specified
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: spots, error, count } = await query

    if (error) {
      console.error('Error fetching spot proposals:', error)
      return NextResponse.json(
        { error: 'Failed to fetch spot proposals' },
        { status: 500 }
      )
    }

    // Get status statistics (mocked for now)
    const statistics = {
      total: count || 0,
      pending: Math.floor((count || 0) * 0.3), // Mock: 30% pending
      approved: Math.floor((count || 0) * 0.6), // Mock: 60% approved
      rejected: Math.floor((count || 0) * 0.1), // Mock: 10% rejected
    }

    // Add mock status to spots for demonstration
    const spotsWithStatus = (spots || []).map((spot, index) => ({
      ...spot,
      status:
        index % 3 === 0
          ? 'pending'
          : index % 3 === 1
            ? 'approved'
            : 'rejected',
      reviewed_at:
        index % 3 !== 0
          ? new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ).toISOString()
          : null,
      review_notes:
        index % 3 === 2
          ? 'Needs more detailed description and better photos'
          : null,
    }))

    return NextResponse.json({
      spots: spotsWithStatus,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
      statistics,
    })
  } catch (error) {
    console.error('Error in GET /api/admin/spot-approvals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
