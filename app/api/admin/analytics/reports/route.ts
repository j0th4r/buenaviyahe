import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Get tourism visitor data (simulated from user registrations and activity)
    const { data: visitorData } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('role', 'user')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Get business registration trends
    const { data: businessData } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('role', 'business_owner')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Get spot submission and approval trends
    const { data: spotsData } = await supabase
      .from('spots')
      .select('created_at, status, updated_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Get revenue data (simulated from business activities)
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('created_at, rating')
      .gte('created_at', startDate.toISOString())

    // Process data for charts
    const chartData = []
    const businessTrends = []
    const spotTrends = []

    // Create daily aggregations
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split('T')[0]

      // Count visitors for this date
      const dailyVisitors =
        visitorData?.filter((v) => v.created_at.startsWith(dateStr))
          .length || 0

      // Count business registrations for this date
      const dailyBusinesses =
        businessData?.filter((b) => b.created_at.startsWith(dateStr))
          .length || 0

      // Count spot submissions for this date
      const dailySpots =
        spotsData?.filter((s) => s.created_at.startsWith(dateStr))
          .length || 0

      // Count spot approvals for this date
      const dailyApprovals =
        spotsData?.filter(
          (s) =>
            s.status === 'approved' &&
            s.updated_at?.startsWith(dateStr)
        ).length || 0

      chartData.push({
        date: dateStr,
        visitors: dailyVisitors,
        revenue: dailyVisitors * 150 + Math.random() * 100, // Simulated revenue
      })

      businessTrends.push({
        date: dateStr,
        registrations: dailyBusinesses,
        spots: dailySpots,
      })

      spotTrends.push({
        date: dateStr,
        submissions: dailySpots,
        approvals: dailyApprovals,
      })
    }

    // Calculate summary statistics
    const totalVisitors = visitorData?.length || 0
    const totalBusinesses = businessData?.length || 0
    const totalSpots = spotsData?.length || 0
    const approvedSpots =
      spotsData?.filter((s) => s.status === 'approved').length || 0
    const avgRating =
      reviewsData?.length > 0
        ? reviewsData.reduce((sum, r) => sum + r.rating, 0) /
          reviewsData.length
        : 0

    // Top performing locations (simulated)
    const { data: topSpots } = await supabase
      .from('spots')
      .select(
        `
        title,
        location,
        reviews!inner(rating)
      `
      )
      .eq('status', 'approved')
      .limit(5)

    const topLocations =
      topSpots?.map((spot) => ({
        name: spot.title,
        location: spot.location,
        visitors: Math.floor(Math.random() * 1000) + 100,
        rating:
          spot.reviews?.length > 0
            ? spot.reviews.reduce(
                (sum: number, r: any) => sum + r.rating,
                0
              ) / spot.reviews.length
            : 0,
      })) || []

    return NextResponse.json({
      chartData,
      businessTrends,
      spotTrends,
      summary: {
        totalVisitors,
        totalBusinesses,
        totalSpots,
        approvedSpots,
        avgRating: Math.round(avgRating * 10) / 10,
        approvalRate:
          totalSpots > 0
            ? Math.round((approvedSpots / totalSpots) * 100)
            : 0,
      },
      topLocations,
    })
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
