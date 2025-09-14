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

    // Get all analytics data in parallel
    const [
      { data: recentVisitorData },
      { data: recentBusinessData },
      { data: recentSpotsData },
      { data: recentReviewsData },
      { data: categoriesData },
      { data: recentItinerariesData },
      { data: allSpotsData },
      { data: allVisitorData },
      { data: allBusinessData },
      { data: allReviewsData },
    ] = await Promise.all([
      // Recent visitor data (for trends)
      supabase
        .from('profiles')
        .select('id, created_at, city, role, name')
        .eq('role', 'user')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),

      // Recent business data (for trends)
      supabase
        .from('profiles')
        .select('id, created_at, city, name, role')
        .eq('role', 'business_owner')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),

      // Recent spots data (for trends)
      supabase
        .from('spots')
        .select(
          `
          id,
          title,
          location,
          tags,
          created_at, 
          updated_at,
          status,
          rating,
          reviews,
          owner_id,
          profiles!spots_owner_id_fkey(name)
        `
        )
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),

      // Recent reviews data (for trends)
      supabase
        .from('reviews')
        .select('created_at, rating, spot_id, user_id')
        .gte('created_at', startDate.toISOString()),

      // Categories data
      supabase.from('categories').select('*'),

      // Recent itineraries data (for trends)
      supabase
        .from('itineraries')
        .select('created_at, title, user_id')
        .gte('created_at', startDate.toISOString()),

      // All spots with their tags for category analysis
      supabase
        .from('spots')
        .select(
          'id, title, tags, location, status, rating, reviews, created_at, owner_id, profiles!spots_owner_id_fkey(name)'
        ),

      // All visitor data for complete analytics
      supabase
        .from('profiles')
        .select('id, created_at, city, role, name')
        .eq('role', 'user')
        .order('created_at', { ascending: false }),

      // All business data for complete analytics
      supabase
        .from('profiles')
        .select('id, created_at, city, name, role')
        .eq('role', 'business_owner')
        .order('created_at', { ascending: false }),

      // All reviews for comprehensive analysis
      supabase
        .from('reviews')
        .select('created_at, rating, spot_id, user_id')
        .order('created_at', { ascending: false }),
    ])

    // Process category trends based on all spot tags
    const categoryTrends = await processCategoryTrends(
      allSpotsData || [],
      supabase
    )

    // Process spot analytics data for table (use all spots for complete view)
    const spotAnalytics = processSpotAnalytics(allSpotsData || [])

    // Process business analytics data for table (use all business data)
    const businessAnalytics = processBusinessAnalytics(
      allBusinessData || [],
      allSpotsData || []
    )

    // Process user analytics data for table (use all user data)
    const userAnalytics = await processUserAnalytics(
      allVisitorData || [],
      supabase
    )

    // Process daily trends for charts (use recent data for trends)
    const { chartData, businessTrends, spotTrends } =
      await processDailyTrends(
        startDate,
        endDate,
        recentVisitorData || [],
        recentBusinessData || [],
        recentSpotsData || [],
        supabase
      )

    // Calculate comprehensive summary statistics (use all data for totals)
    const summary = calculateSummaryStats(
      allVisitorData || [],
      allBusinessData || [],
      allSpotsData || [],
      allReviewsData || [],
      recentItinerariesData || []
    )

    // Get top performing spots (use all spots)
    const topPerformingSpots = getTopPerformingSpots(
      allSpotsData || [],
      allReviewsData || []
    )

    return NextResponse.json({
      // Time series data for charts
      chartData,
      businessTrends,
      spotTrends,
      categoryTrends,

      // Summary statistics
      summary,

      // Table data for detailed analytics
      spotAnalytics,
      businessAnalytics,
      userAnalytics,

      // Top performers
      topPerformingSpots,

      // Additional insights
      insights: generateInsights(summary, categoryTrends),

      // Data freshness timestamp
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching comprehensive analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comprehensive analytics data' },
      { status: 500 }
    )
  }
}

async function processCategoryTrends(spots: any[], supabase: any) {
  // Get actual categories from the database
  const { data: categoriesFromDB } = await supabase
    .from('categories')
    .select('id, name')

  const categoryCount: Record<
    string,
    {
      count: number
      approved: number
      pending: number
      rejected: number
      avgRating: number
      totalReviews: number
      ratingSum: number
      ratingCount: number
    }
  > = {}

  // Initialize with actual categories from database - use the ID as the key for consistency
  const dbCategories = categoriesFromDB || []
  dbCategories.forEach((cat: any) => {
    const categoryName = cat.name || cat.id
    categoryCount[categoryName] = {
      count: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      avgRating: 0,
      totalReviews: 0,
      ratingSum: 0,
      ratingCount: 0,
    }
  })

  // Process actual spot data - match tags directly with category IDs and names
  spots.forEach((spot) => {
    const tags = spot.tags || []
    const rating = parseFloat(spot.rating) || 0
    const reviews = spot.reviews || 0

    tags.forEach((tag: string) => {
      // Look for category by ID first, then by name (case-insensitive)
      let matchingCategory: string | null = null

      for (const cat of dbCategories) {
        if (
          cat.id.toLowerCase() === tag.toLowerCase() ||
          cat.name.toLowerCase() === tag.toLowerCase()
        ) {
          matchingCategory = cat.name || cat.id
          break
        }
      }

      if (matchingCategory && categoryCount[matchingCategory]) {
        categoryCount[matchingCategory].count++
        categoryCount[matchingCategory].totalReviews += reviews

        if (spot.status === 'approved') {
          categoryCount[matchingCategory].approved++
        } else if (spot.status === 'pending') {
          categoryCount[matchingCategory].pending++
        } else if (spot.status === 'rejected') {
          categoryCount[matchingCategory].rejected++
        }

        if (rating > 0) {
          categoryCount[matchingCategory].ratingSum += rating
          categoryCount[matchingCategory].ratingCount++
          categoryCount[matchingCategory].avgRating =
            categoryCount[matchingCategory].ratingSum /
            categoryCount[matchingCategory].ratingCount
        }
      }
    })
  })

  return Object.entries(categoryCount)
    .map(([category, data]) => ({
      category,
      count: data.count,
      approved: data.approved,
      pending: data.pending,
      rejected: data.rejected,
      avgRating: Math.round(data.avgRating * 10) / 10,
      totalReviews: data.totalReviews,
    }))
    .filter((cat) => cat.count > 0) // Only show categories with spots
    .sort((a, b) => b.count - a.count)
}

function processSpotAnalytics(spots: any[]) {
  return spots
    .map((spot) => {
      const rating = parseFloat(spot.rating) || 0
      const reviews = spot.reviews || 0

      return {
        id: spot.id,
        title: spot.title,
        location: spot.location,
        status: spot.status,
        rating: rating,
        reviews: reviews,
        tags: spot.tags || [],
        submittedAt: spot.created_at,
        submittedBy: spot.profiles?.name || 'LGU Admin',
        category:
          spot.tags && spot.tags.length > 0
            ? spot.tags[0].charAt(0).toUpperCase() +
              spot.tags[0].slice(1)
            : 'Uncategorized',
        performance: calculateSpotPerformance(rating, reviews),
      }
    })
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() -
        new Date(a.submittedAt).getTime()
    )
}

function processBusinessAnalytics(businesses: any[], spots: any[]) {
  return businesses
    .map((business) => {
      const businessSpots = spots.filter(
        (spot) => spot.owner_id === business.id
      )

      const totalRating = businessSpots.reduce(
        (sum, spot) => sum + (parseFloat(spot.rating) || 0),
        0
      )
      const totalReviews = businessSpots.reduce(
        (sum, spot) => sum + (spot.reviews || 0),
        0
      )

      const avgRating =
        businessSpots.length > 0
          ? totalRating / businessSpots.length
          : 0

      return {
        id: business.id || business.name,
        name: business.name,
        city: business.city,
        joinedAt: business.created_at,
        spotsCount: businessSpots.length,
        approvedSpots: businessSpots.filter(
          (s) => s.status === 'approved'
        ).length,
        pendingSpots: businessSpots.filter(
          (s) => s.status === 'pending'
        ).length,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        performance: calculateBusinessPerformance(
          businessSpots.length,
          avgRating,
          totalReviews
        ),
      }
    })
    .sort((a, b) => b.spotsCount - a.spotsCount)
}

async function processUserAnalytics(users: any[], supabase: any) {
  // Get actual user activity data
  const userIds = users.map((u) => u.id).filter(Boolean)

  const { data: reviewActivity } = await supabase
    .from('reviews')
    .select('user_id, created_at')
    .in('user_id', userIds)

  const { data: itineraryActivity } = await supabase
    .from('itineraries')
    .select('user_id, created_at')
    .in('user_id', userIds)

  return users
    .map((user) => {
      // Calculate real engagement based on activity
      const userReviews =
        reviewActivity?.filter((r: any) => r.user_id === user.id) ||
        []
      const userItineraries =
        itineraryActivity?.filter(
          (i: any) => i.user_id === user.id
        ) || []

      const totalActivity =
        userReviews.length + userItineraries.length
      const daysSinceJoined = Math.max(
        1,
        Math.floor(
          (new Date().getTime() -
            new Date(user.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )

      // Engagement score based on activity frequency
      const engagementScore = Math.min(
        100,
        Math.round((totalActivity / daysSinceJoined) * 100)
      )

      return {
        id:
          user.id ||
          `user-${user.name?.replace(/\s+/g, '-').toLowerCase()}`,
        name: user.name || 'Anonymous User',
        city: user.city || 'Unknown',
        joinedAt: user.created_at,
        role: user.role,
        activity: totalActivity > 0 ? 'Active' : 'Inactive',
        engagement: engagementScore,
      }
    })
    .sort(
      (a, b) =>
        new Date(b.joinedAt).getTime() -
        new Date(a.joinedAt).getTime()
    )
}

async function processDailyTrends(
  startDate: Date,
  endDate: Date,
  visitors: any[],
  businesses: any[],
  spots: any[],
  supabase: any
) {
  const chartData = []
  const businessTrends = []
  const spotTrends = []

  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setDate(d.getDate() + 1)
  ) {
    const dateStr = d.toISOString().split('T')[0]

    const dailyVisitors = visitors.filter((v) =>
      v.created_at.startsWith(dateStr)
    ).length
    const dailyBusinesses = businesses.filter((b) =>
      b.created_at.startsWith(dateStr)
    ).length
    const dailySpots = spots.filter((s) =>
      s.created_at.startsWith(dateStr)
    ).length
    const dailyApprovals = spots.filter(
      (s) =>
        s.status === 'approved' && s.updated_at?.startsWith(dateStr)
    ).length

    chartData.push({
      date: dateStr,
      visitors: dailyVisitors,
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

  return { chartData, businessTrends, spotTrends }
}

function calculateSummaryStats(
  visitors: any[],
  businesses: any[],
  spots: any[],
  reviews: any[],
  itineraries: any[]
) {
  const totalVisitors = visitors.length
  const totalBusinesses = businesses.length
  const totalSpots = spots.length
  const approvedSpots = spots.filter(
    (s) => s.status === 'approved'
  ).length

  // Calculate average rating from actual spot ratings (weighted by review count)
  let totalRatingPoints = 0
  let totalReviewCount = 0

  spots.forEach((spot) => {
    const rating = parseFloat(spot.rating) || 0
    const reviewCount = spot.reviews || 0
    if (rating > 0 && reviewCount > 0) {
      totalRatingPoints += rating * reviewCount
      totalReviewCount += reviewCount
    }
  })

  const avgRating =
    totalReviewCount > 0 ? totalRatingPoints / totalReviewCount : 0

  return {
    totalVisitors,
    totalBusinesses,
    totalSpots,
    approvedSpots,
    pendingSpots: spots.filter((s) => s.status === 'pending').length,
    rejectedSpots: spots.filter((s) => s.status === 'rejected')
      .length,
    avgRating: Math.round(avgRating * 10) / 10,
    approvalRate:
      totalSpots > 0
        ? Math.round((approvedSpots / totalSpots) * 100)
        : 0,
    totalReviews: reviews.length,
    totalItineraries: itineraries.length,
    growth: {
      visitorsGrowth: calculateGrowthRate(visitors),
      businessGrowth: calculateGrowthRate(businesses),
      spotsGrowth: calculateGrowthRate(spots),
    },
  }
}

function getTopPerformingSpots(spots: any[], reviews: any[]) {
  return spots
    .filter(
      (spot) =>
        spot.status === 'approved' && parseFloat(spot.rating) > 0
    )
    .map((spot) => {
      const rating = parseFloat(spot.rating) || 0
      const reviewCount = spot.reviews || 0
      const spotReviews = reviews.filter((r) => r.spot_id === spot.id)

      // Calculate performance score based on rating and review volume
      const performanceScore = rating * reviewCount

      // Calculate estimated visitor count based on review activity
      const estimatedVisitors = Math.max(
        reviewCount * 10,
        reviewCount * rating
      )

      return {
        name: spot.title,
        location: spot.location,
        rating: rating,
        reviews: reviewCount,
        category:
          spot.tags?.[0]?.charAt(0).toUpperCase() +
            spot.tags?.[0]?.slice(1) || 'Uncategorized',
        visitors: estimatedVisitors,
        performanceScore,
      }
    })
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 10)
}

function calculateSpotPerformance(rating: number, reviews: number) {
  if (reviews === 0) return 'New'
  if (rating >= 4.5 && reviews >= 20) return 'Excellent'
  if (rating >= 4.0 && reviews >= 10) return 'Good'
  if (rating >= 3.5 && reviews >= 5) return 'Fair'
  return 'Poor'
}

function calculateBusinessPerformance(
  spotsCount: number,
  avgRating: number,
  totalReviews: number
) {
  if (spotsCount === 0) return 'Inactive'
  if (spotsCount >= 5 && totalReviews >= 50 && avgRating >= 4.5)
    return 'Leading'
  if (spotsCount >= 3 && totalReviews >= 20 && avgRating >= 4.0)
    return 'Growing'
  if (spotsCount >= 1 && totalReviews >= 5 && avgRating >= 3.5)
    return 'Active'
  if (spotsCount >= 1) return 'Starting'
  return 'Inactive'
}

function calculateGrowthRate(data: any[]) {
  if (data.length < 2) return 0

  const now = new Date()
  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  )
  const sixtyDaysAgo = new Date(
    now.getTime() - 60 * 24 * 60 * 60 * 1000
  )

  const recentCount = data.filter(
    (d) => new Date(d.created_at) > thirtyDaysAgo
  ).length
  const previousCount = data.filter((d) => {
    const date = new Date(d.created_at)
    return date > sixtyDaysAgo && date <= thirtyDaysAgo
  }).length

  if (previousCount === 0) return recentCount > 0 ? 100 : 0
  return Math.round(
    ((recentCount - previousCount) / previousCount) * 100
  )
}

function generateInsights(summary: any, categoryTrends: any[]) {
  const insights = []

  // Growth insights
  if (summary.growth.visitorsGrowth > 20) {
    insights.push({
      type: 'positive',
      title: 'Strong Visitor Growth',
      description: `Visitor registrations increased by ${summary.growth.visitorsGrowth}% in the last 30 days.`,
    })
  }

  // Category insights
  const topCategory = categoryTrends[0]
  if (topCategory && topCategory.count > 0) {
    insights.push({
      type: 'info',
      title: 'Popular Category',
      description: `${topCategory.category} is the most popular category with ${topCategory.count} spots.`,
    })
  }

  // Performance insights
  if (summary.approvalRate > 80) {
    insights.push({
      type: 'positive',
      title: 'High Approval Rate',
      description: `${summary.approvalRate}% of submitted spots have been approved.`,
    })
  } else if (summary.approvalRate < 60) {
    insights.push({
      type: 'warning',
      title: 'Low Approval Rate',
      description: `Only ${summary.approvalRate}% of spots are approved. Consider review process improvements.`,
    })
  }

  return insights
}
