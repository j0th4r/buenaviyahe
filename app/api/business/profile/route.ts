import { createServiceClient } from '@/lib/supabase/config'
import { NextRequest, NextResponse } from 'next/server'
import { requireBusinessOwner } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  try {
    // Verify business owner authentication
    const user = await requireBusinessOwner()

    const supabase = createServiceClient()

    // Get business owner profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching business profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify business owner authentication
    const user = await requireBusinessOwner()

    const body = await request.json()
    const supabase = createServiceClient()

    // Update business owner profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating business profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


