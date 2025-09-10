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
import {
  MapPin,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Eye,
} from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/config'

async function getDashboardStats() {
  const supabase = createServiceClient()

  try {
    // Get total spots count
    const { count: spotsCount } = await supabase
      .from('spots')
      .select('*', { count: 'exact', head: true })

    // Get total reviews count and average rating
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('rating')

    const totalReviews = reviewsData?.length || 0
    const avgRating = reviewsData?.length
      ? reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0) /
        reviewsData.length
      : 0

    // Get recent reviews (last 7 days)
    const weekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString()
    const { count: recentReviews } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo)

    // Get top-rated spots
    const { data: topSpots } = await supabase
      .from('spots')
      .select('id, title, rating, reviews')
      .order('rating', { ascending: false })
      .limit(5)

    return {
      spotsCount: spotsCount || 0,
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      recentReviews: recentReviews || 0,
      topSpots: topSpots || [],
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      spotsCount: 0,
      totalReviews: 0,
      avgRating: 0,
      recentReviews: 0,
      topSpots: [],
    }
  }
}

export default async function AdminDashboard() {
  const user = await requireAdmin()
  const stats = await getDashboardStats()

  return (
    <AdminLayout user={user}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-950">
              Total Listings
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.spotsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Active tourist spots
            </p>
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
              {stats.totalReviews}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentReviews} this week
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
              {stats.avgRating}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-950">
              Response Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Review responses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-teal-950">
              Top Performing Spots
            </CardTitle>
            <CardDescription>
              Your highest-rated tourist destinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSpots.map((spot, index) => (
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
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      <span>{spot.rating}</span>
                      <span>•</span>
                      <span>{spot.reviews} reviews</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{spot.rating} ⭐</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-teal-950">
              Quick Actions
            </CardTitle>
            <CardDescription>Common management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <a
                href="/admin/listings/new"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <MapPin className="h-4 w-4 text-muted-foreground text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-teal-950">
                    Add New Listing
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Create a new tourist spot
                  </p>
                </div>
              </a>

              <a
                href="/admin/reviews"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-teal-950">
                    Manage Reviews
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Respond to customer feedback
                  </p>
                </div>
              </a>

              {/* <a
                href="/admin/upload"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <Eye className="h-4 w-4 text-muted-foreground text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-teal-950">
                    Upload Photos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add new images to listings
                  </p>
                </div>
              </a> */}

              <a
                href="/admin/analytics"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <TrendingUp className="h-4 w-4 text-muted-foreground text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-teal-950">
                    View Analytics
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Performance insights
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">New review received</p>
                  <p className="text-xs text-muted-foreground">
                    2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">Listing updated</p>
                  <p className="text-xs text-muted-foreground">
                    1 day ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">Photos uploaded</p>
                  <p className="text-xs text-muted-foreground">
                    3 days ago
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
