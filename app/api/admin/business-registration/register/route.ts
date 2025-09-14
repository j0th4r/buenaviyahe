import { NextRequest, NextResponse } from 'next/server'
import {
  createServiceClient,
  createServerClient,
} from '@/lib/supabase/config'
import { z } from 'zod'

// Validation schema for business owner registration
const BusinessOwnerRegistrationSchema = z.object({
  ownerName: z.string().min(1, 'Owner name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Use server client for authentication check
    const supabase = await createServerClient()

    // Check if the user is authenticated and is an admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    // Use service client for creating users (requires elevated privileges)
    const serviceSupabase = createServiceClient()

    // Parse and validate the request body
    const body = await request.json()
    const validatedData = BusinessOwnerRegistrationSchema.parse(body)

    // Create the user account first
    const { data: authData, error: signUpError } =
      await serviceSupabase.auth.signUp({
        email: validatedData.email,
        password: Math.random().toString(36).slice(-12), // Generate a random password
        options: {
          data: {
            name: validatedData.ownerName,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/business`,
        },
      })

    if (signUpError) {
      console.error('Signup error:', signUpError)
      if (signUpError.message.includes('User already registered')) {
        return NextResponse.json(
          {
            error:
              'A user with this email already exists. Please use a different email address.',
          },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create the user profile with business_owner role
    const { error: profileCreateError } = await serviceSupabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: validatedData.ownerName,
        city: validatedData.address.split(',').pop()?.trim() || '', // Extract city from address
        website: validatedData.website || null,
        about: validatedData.description || '',
        role: 'business_owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileCreateError) {
      console.error('Profile creation error:', profileCreateError)
      return NextResponse.json(
        {
          error: 'Failed to create business owner profile',
          details: profileCreateError.message,
        },
        { status: 500 }
      )
    }

    // Send password reset email so the business owner can set their own password
    const { error: resetError } =
      await serviceSupabase.auth.resetPasswordForEmail(
        validatedData.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
        }
      )

    if (resetError) {
      console.error('Password reset email error:', resetError)
      // Don't fail the whole process if email fails
    }

    return NextResponse.json({
      success: true,
      message:
        'Business owner registered successfully. They can now sign in and add their tourism spots. An email has been sent to set their password.',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: validatedData.ownerName,
        },
      },
    })
  } catch (error) {
    console.error('Business owner registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
