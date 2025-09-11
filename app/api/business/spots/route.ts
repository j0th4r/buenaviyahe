import { createServiceClient } from '@/lib/supabase/config'
import { NextRequest, NextResponse } from 'next/server'
import { requireBusinessOwner } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  try {
    // Verify business owner authentication
    const user = await requireBusinessOwner()

    const supabase = createServiceClient()

    // Get spots owned by this business owner
    const { data: spots, error } = await supabase
      .from('spots')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ spots })
  } catch (error) {
    console.error('Error fetching business spots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify business owner authentication
    const user = await requireBusinessOwner()

    const body = await request.json()
    const supabase = createServiceClient()

    // Create new spot owned by this business owner
    const { data: spot, error } = await supabase
      .from('spots')
      .insert([
        {
          ...body,
          owner_id: user.id,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ spot }, { status: 201 })
  } catch (error) {
    console.error('Error creating business spot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

