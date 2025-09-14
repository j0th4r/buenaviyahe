import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'
import { requireAdminAPI } from '@/lib/auth/admin'
import { z } from 'zod'

const businessRegistrationSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Business address is required'),
  businessType: z.enum([
    'hotel',
    'restaurant',
    'tour',
    'transport',
    'attraction',
    'other',
  ]),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  permitNumber: z.string().optional(),
  dtiNumber: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdminAPI(request)
    const supabase = createServiceClient()
    const body = await request.json()

    // Validate input
    const validatedData = businessRegistrationSchema.parse(body)

    // Check if user already exists
    const { data: existingUser } =
      await supabase.auth.admin.getUserByEmail(validatedData.email)

    if (existingUser.user) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user account
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: validatedData.email,
        password: generateTempPassword(), // Generate temporary password
        email_confirm: true, // Auto-confirm email for admin-created accounts
      })

    if (authError || !authUser.user) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create profile with business owner role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        name: validatedData.businessName, // Using business name as profile name
        city: extractCityFromAddress(validatedData.address),
        website: validatedData.website || null,
        about:
          `${validatedData.businessType} business: ${validatedData.description || ''}`.trim(),
        role: 'business_owner',
        joined_year: new Date().getFullYear(),
        contributions: 0,
        avatar_url: null,
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Cleanup: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { error: 'Failed to create business profile' },
        { status: 500 }
      )
    }

    // Store additional business details (you might want to create a separate businesses table)
    // For now, we'll log the additional details
    console.log('Business registration details:', {
      userId: authUser.user.id,
      ownerName: validatedData.ownerName,
      phone: validatedData.phone,
      address: validatedData.address,
      businessType: validatedData.businessType,
      permitNumber: validatedData.permitNumber,
      dtiNumber: validatedData.dtiNumber,
    })

    // TODO: Send welcome email with temporary password
    // TODO: Send SMS with account details

    return NextResponse.json(
      {
        id: authUser.user.id,
        email: authUser.user.email,
        businessName: validatedData.businessName,
        ownerName: validatedData.ownerName,
        tempPassword: generateTempPassword(), // Return temp password for admin to share
        message: 'Business owner account created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(
      'Error in POST /api/admin/business-registration:',
      error
    )

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

    // Get all business owners
    const { data: businessOwners, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'business_owner')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching business owners:', error)
      return NextResponse.json(
        { error: 'Failed to fetch business owners' },
        { status: 500 }
      )
    }

    return NextResponse.json(businessOwners)
  } catch (error) {
    console.error(
      'Error in GET /api/admin/business-registration:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateTempPassword(): string {
  // Generate a temporary password
  const length = 12
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  let password = ''

  for (let i = 0; i < length; i++) {
    password += charset.charAt(
      Math.floor(Math.random() * charset.length)
    )
  }

  return password
}

function extractCityFromAddress(address: string): string {
  // Simple city extraction - you might want to make this more sophisticated
  const parts = address.split(',')
  if (parts.length >= 2) {
    return parts[parts.length - 2].trim()
  }
  return address.split(' ').slice(-2, -1)[0] || 'Unknown'
}
