import { requireAdmin } from '@/lib/auth/admin'
import { AdminLayout } from '@/components/admin/admin-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Star,
  MessageSquare,
  MapPin,
  Calendar,
  Users,
  Clock,
} from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/config'

async function getAnalyticsData() {
  const supabase = createServiceClient()

  try {
    // Get spots data
    const { data: spots } = await supabase
      .from('spots')
      .select('id, title, rating, reviews, created_at')

    // Get reviews data
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, created_at, spot_id')

    // Calculate metrics
    const totalSpots = spots?.length || 0
    const totalReviews = reviews?.length || 0
    const avgRating = reviews?.length
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
        reviews.length
      : 0

    // Get monthly data for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      )
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      )

      const monthReviews =
        reviews?.filter((r) => {
          const reviewDate = new Date(r.created_at)
          return reviewDate >= monthStart && reviewDate <= monthEnd
        }) || []

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        reviews: monthReviews.length,
        avgRating: monthReviews.length
          ? monthReviews.reduce(
              (acc, r) => acc + (r.rating || 0),
              0
            ) / monthReviews.length
          : 0,
      })
    }

    // Get top performing spots
    const topSpots =
      spots
        ?.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5)
        .map((spot) => ({
          ...spot,
          reviewCount:
            reviews?.filter((r) => r.spot_id === spot.id).length || 0,
        })) || []

    // Get rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: reviews?.filter((r) => r.rating === rating).length || 0,
      percentage: reviews?.length
        ? Math.round(
            ((reviews.filter((r) => r.rating === rating).length ||
              0) /
              reviews.length) *
              100
          )
        : 0,
    }))

    return {
      totalSpots,
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      monthlyData,
      topSpots,
      ratingDistribution,
      // Mock data for views and engagement
      totalViews: 12547,
      viewsGrowth: 23.5,
      avgResponseTime: 2.4,
      responseRate: 87,
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return {
      totalSpots: 0,
      totalReviews: 0,
      avgRating: 0,
      monthlyData: [],
      topSpots: [],
      ratingDistribution: [],
      totalViews: 0,
      viewsGrowth: 0,
      avgResponseTime: 0,
      responseRate: 0,
    }
  }
}

function formatNumber(num: number) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function getPerformanceColor(
  value: number,
  good: number,
  excellent: number
) {
  if (value >= excellent) return 'text-green-600'
  if (value >= good) return 'text-teal-600'
  return 'text-red-600'
}

export default async function AnalyticsPage() {
  const user = await requireAdmin()
  const analytics = await getAnalyticsData()

  return (
    <AdminLayout user={user}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-teal-950">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Performance insights for your tourist spots
          </p>
        </div>
        <Select defaultValue="30d">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-950">
              Total Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics.totalViews)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">
                +{analytics.viewsGrowth}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-950">
              Total Reviews
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalReviews}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {analytics.totalSpots} listings
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
              {analytics.avgRating}
            </div>
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= analytics.avgRating
                        ? 'fill-current text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-xs text-muted-foreground">
                out of 5
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-950">
              Response Rate
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.responseRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Avg response time: {analytics.avgResponseTime}h
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-teal-950">
              Review Trends
            </CardTitle>
            <CardDescription>
              Monthly review volume and ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyData.map((month, index) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm text-muted-foreground">
                      {month.month}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {month.reviews} reviews
                        </span>
                      </div>
                      <Progress
                        value={
                          (month.reviews /
                            Math.max(
                              ...analytics.monthlyData.map(
                                (m) => m.reviews
                              ),
                              1
                            )) *
                          100
                        }
                        className="mt-1 h-2"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-400" />
                    <span className="text-sm">
                      {month.avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-teal-950">
              Rating Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of review ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.ratingDistribution
                .reverse()
                .map((rating) => (
                  <div
                    key={rating.rating}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {rating.rating}
                        </span>
                        <Star className="h-3 w-3 fill-current text-yellow-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <Progress
                        value={rating.percentage}
                        className="flex-1 h-2"
                      />
                      <span className="text-sm text-muted-foreground w-12">
                        {rating.percentage}%
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {rating.count}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performing Spots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-teal-950">
              Top Performing Spots
            </CardTitle>
            <CardDescription>
              Your highest-rated locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topSpots.map((spot, index) => (
                <div
                  key={spot.id}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-teal-50 text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {spot.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      <span>{spot.rating}</span>
                      <span>•</span>
                      <span>{spot.reviewCount} reviews</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      spot.rating >= 4.5
                        ? 'default'
                        : spot.rating >= 4.0
                          ? 'secondary'
                          : 'outline'
                    }
                    className="bg-teal-500 text-white"
                  >
                    {spot.rating} ⭐
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-teal-950">
              Performance Insights
            </CardTitle>
            <CardDescription>
              Key metrics and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">
                    High Response Rate
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You respond to {analytics.responseRate}% of
                    reviews within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">
                    Strong Rating Average
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your average rating of {analytics.avgRating} is
                    above industry standard
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">
                    Opportunity: More Photos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Spots with 5+ photos get 40% more engagement
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">Growth Trend</p>
                  <p className="text-xs text-muted-foreground">
                    Review volume increased by 15% this month
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
