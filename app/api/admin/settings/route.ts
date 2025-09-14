import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Get the admin user's profile data for LGU settings
    const { data: adminProfiles, error: profileError } =
      await supabase
        .from('profiles')
        .select('name, city, website, about')
        .eq('role', 'admin')
        .limit(1)
        .single()

    if (profileError) {
      console.error('Error fetching admin profile:', profileError)
    }

    // Map profile data to settings format, with fallbacks
    const settings = {
      general: {
        lguName: adminProfiles?.name || 'Municipal Tourism Office',
        address:
          adminProfiles?.city ||
          '123 Municipal Building, City Center',
        website:
          adminProfiles?.website || 'www.municipality-tourism.gov.ph',
        description:
          adminProfiles?.about ||
          'Official tourism portal for our beautiful municipality',
      },
      security: {
        requireEmailVerification: true,
        requireBusinessVerification: true,
        autoApproveSpots: false,
        maxLoginAttempts: 5,
        sessionTimeout: 24, // hours
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notifyOnNewBusiness: true,
        notifyOnSpotSubmission: true,
        notifyOnReviews: true,
      },
      features: {
        enableChatbot: true,
        enableReviews: true,
        enableItineraryPlanning: true,
        enableBusinessRegistration: true,
        maintenanceMode: false,
      },
    }

    // Get user roles and permissions
    const { data: userRoles } = await supabase
      .from('profiles')
      .select('role')
      .neq('role', null)

    const roleCounts = userRoles?.reduce((acc: any, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      settings,
      roleCounts: roleCounts || {},
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { section, settings } = body

    if (section === 'general') {
      // Update the admin user's profile with the new settings
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: settings.lguName,
          city: settings.address,
          website: settings.website,
          about: settings.description,
          updated_at: new Date().toISOString(),
        })
        .eq('role', 'admin')

      if (updateError) {
        console.error('Error updating admin profile:', updateError)
        return NextResponse.json(
          { error: 'Failed to update profile settings' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `${section} settings updated successfully`,
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
