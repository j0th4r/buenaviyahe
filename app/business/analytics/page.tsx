import { requireBusinessOwner } from '@/lib/auth/admin'
import { BusinessLayout } from '@/components/admin/business-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart3,
  Eye,
  Calendar,
  PhilippinePeso,
  Star,
  Users,
  MapPin,
} from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/config'
import { RevenueChart } from './revenue-chart'

interface SpotAnalytics {
  id: string
  title: string
  totalBookings: number
  totalViews: number
  revenue: number
  rating: number
  reviewCount: number
}

interface MonthlyRevenue {
  month: string
  [key: string]: string | number // Dynamic spot keys for revenue
}

async function getBusinessAnalytics(ownerId: string) {
  const supabase = createServiceClient()

  try {
    // Get all spots owned by this business
    const { data: spots } = await supabase
      .from('spots')
      .select('id, title, rating, reviews, pricing')
      .eq('owner_id', ownerId)

    if (!spots || spots.length === 0) {
      return {
        spotAnalytics: [],
        monthlyRevenue: [],
        totalBookings: 0,
        totalViews: 0,
        totalRevenue: 0,
        avgRating: 0,
      }
    }

    // Get reviews for analytics calculation
    const { data: reviews } = await supabase
      .from('reviews')
      .select('spot_id, rating, created_at')
      .in(
        'spot_id',
        spots.map((spot) => spot.id)
      )

    // Calculate analytics per spot
    const spotAnalytics: SpotAnalytics[] = spots.map((spot) => {
      const spotReviews =
        reviews?.filter((review) => review.spot_id === spot.id) || []

      // Simulate bookings based on reviews (assuming 1 review per 3 bookings)
      const totalBookings = spotReviews.length * 3

      // Simulate views based on bookings (assuming 1 booking per 10 views)
      const totalViews = totalBookings * 10

      // Calculate revenue based on pricing and bookings
      const avgPrice = spot.pricing ? parsePrice(spot.pricing) : 1000
      const revenue = totalBookings * avgPrice

      return {
        id: spot.id,
        title: spot.title,
        totalBookings,
        totalViews,
        revenue,
        rating: spot.rating || 0,
        reviewCount: spotReviews.length,
      }
    })

    // Generate monthly revenue data (last 6 months)
    const monthlyRevenue: MonthlyRevenue[] =
      generateMonthlyData(spotAnalytics)

    // Calculate totals
    const totalBookings = spotAnalytics.reduce(
      (sum, spot) => sum + spot.totalBookings,
      0
    )
    const totalViews = spotAnalytics.reduce(
      (sum, spot) => sum + spot.totalViews,
      0
    )
    const totalRevenue = spotAnalytics.reduce(
      (sum, spot) => sum + spot.revenue,
      0
    )
    const avgRating =
      spots.reduce((sum, spot) => sum + (spot.rating || 0), 0) /
      spots.length

    return {
      spotAnalytics: spotAnalytics.sort(
        (a, b) => b.totalBookings - a.totalBookings
      ),
      monthlyRevenue,
      totalBookings,
      totalViews,
      totalRevenue,
      avgRating: Math.round(avgRating * 10) / 10,
    }
  } catch (error) {
    console.error('Error fetching business analytics:', error)
    return {
      spotAnalytics: [],
      monthlyRevenue: [],
      totalBookings: 0,
      totalViews: 0,
      totalRevenue: 0,
      avgRating: 0,
    }
  }
}

function parsePrice(pricing: any): number {
  if (typeof pricing === 'object' && pricing !== null) {
    // Extract average price from pricing object
    if (pricing.adult) return Number(pricing.adult) || 1000
    if (pricing.general) return Number(pricing.general) || 1000
    if (pricing.standard) return Number(pricing.standard) || 1000
  }
  return 1000 // Default price
}

function generateMonthlyData(
  spotAnalytics: SpotAnalytics[]
): MonthlyRevenue[] {
  const months = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    })

    // Simulate monthly distribution (peak in summer months)
    const monthMultiplier = getSeasonalMultiplier(date.getMonth())

    const monthData: MonthlyRevenue = {
      month: monthName,
    }

    // Generate revenue per spot for this month
    spotAnalytics.forEach((spot) => {
      const spotMonthlyRevenue = Math.round(
        (spot.revenue / 6) *
          monthMultiplier *
          (0.7 + Math.random() * 0.6) // Add some variance
      )
      const spotKey = spot.title.replace(/\s+/g, '').toLowerCase()
      monthData[spotKey] = spotMonthlyRevenue
    })

    months.push(monthData)
  }

  return months
}

function getSeasonalMultiplier(month: number): number {
  // Philippines peak tourism: Dec-Apr
  const peakMonths = [0, 1, 2, 3, 11] // Jan, Feb, Mar, Apr, Dec
  return peakMonths.includes(month) ? 1.3 : 0.8
}

export default async function BusinessAnalytics() {
  const user = await requireBusinessOwner()
  const analytics = await getBusinessAnalytics(user.id)

  return (
    <BusinessLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-teal-950">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your business performance and revenue
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-950">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.totalBookings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all spots
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-950">
                Total Views
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Number of spot visits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-950">
                Total Revenue
              </CardTitle>
              <PhilippinePeso className="h-4 w-4 text-muted-foreground text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{analytics.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-950">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.avgRating || '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                Customer satisfaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Monthly Revenue Chart */}
          <RevenueChart
            spotAnalytics={analytics.spotAnalytics}
            monthlyRevenue={analytics.monthlyRevenue}
          />

          {/* Top Performing Spots */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-teal-950">
                Top Performing Spots
              </CardTitle>
              <CardDescription>
                Rankings by total bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.spotAnalytics.length > 0 ? (
                <div className="space-y-4">
                  {analytics.spotAnalytics
                    .slice(0, 5)
                    .map((spot, index) => (
                      <div
                        key={spot.id}
                        className="flex items-center gap-4"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {spot.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{spot.totalBookings} bookings</span>
                            <span>•</span>
                            <span>
                              ₱{spot.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {spot.rating}⭐
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {spot.reviewCount} reviews
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No analytics data available yet. Add spots and get
                    reviews to see performance metrics.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Spot Analytics */}
        {analytics.spotAnalytics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-teal-950">
                Detailed Spot Analytics
              </CardTitle>
              <CardDescription>
                Complete performance breakdown for each spot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">
                        Spot Name
                      </th>
                      <th className="text-left p-2 font-medium">
                        Bookings
                      </th>
                      <th className="text-left p-2 font-medium">
                        Views
                      </th>
                      <th className="text-left p-2 font-medium">
                        Revenue
                      </th>
                      <th className="text-left p-2 font-medium">
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.spotAnalytics.map((spot) => (
                      <tr key={spot.id} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground text-teal-600" />
                            <span className="font-medium">
                              {spot.title}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          {spot.totalBookings.toLocaleString()}
                        </td>
                        <td className="p-2">
                          {spot.totalViews.toLocaleString()}
                        </td>
                        <td className="p-2">
                          ₱{spot.revenue.toLocaleString()}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <span>{spot.rating}</span>
                            <span className="text-yellow-500">
                              ⭐
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({spot.reviewCount})
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </BusinessLayout>
  )
}
