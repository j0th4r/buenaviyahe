import { requireBusinessOwner } from '@/lib/auth/admin'
import { BusinessLayout } from '@/components/admin/business-layout'
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
  Eye,
  Plus,
} from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/config'
import Link from 'next/link'

async function getBusinessStats(ownerId: string) {
  const supabase = createServiceClient()

  try {
    // Get spots owned by this business owner
    const { data: spots, count: spotsCount } = await supabase
      .from('spots')
      .select('id, title, rating, reviews', { count: 'exact' })
      .eq('owner_id', ownerId)

    // Get reviews for owner's spots
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, created_at')
      .in('spot_id', spots?.map((spot) => spot.id) || [])

    const totalReviews = reviews?.length || 0
    const avgRating = reviews?.length
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
        reviews.length
      : 0

    // Get recent reviews (last 7 days)
    const weekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString()
    const recentReviews =
      reviews?.filter(
        (review) => new Date(review.created_at) >= new Date(weekAgo)
      ).length || 0

    // Get top-rated spots
    const topSpots =
      spots
        ?.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3) || []

    return {
      spotsCount: spotsCount || 0,
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      recentReviews,
      topSpots,
      spots: spots || [],
    }
  } catch (error) {
    console.error('Error fetching business stats:', error)
    return {
      spotsCount: 0,
      totalReviews: 0,
      avgRating: 0,
      recentReviews: 0,
      topSpots: [],
      spots: [],
    }
  }
}

export default async function BusinessDashboard() {
  const user = await requireBusinessOwner()
  const stats = await getBusinessStats(user.id)

  return (
    <BusinessLayout user={user}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-950">
              My Spots
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.spotsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Active locations
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
              {stats.avgRating || '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-950">
              Performance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgRating >= 4
                ? 'Great'
                : stats.avgRating >= 3
                  ? 'Good'
                  : 'Improving'}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-teal-950">
              My Top Spots
            </CardTitle>
            <CardDescription>
              Your highest-rated locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topSpots.length > 0 ? (
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
                    <Badge variant="secondary">
                      {spot.rating} ⭐
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have any spots yet. Get started by adding
                  your first location.
                </p>
                <Link href="/business/spots/new">
                  <Badge variant="outline" className="cursor-pointer">
                    <Plus className="h-3 w-3 mr-1" />
                    Add First Spot
                  </Badge>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-teal-950">
              Quick Actions
            </CardTitle>
            <CardDescription>Manage your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <Link
                href="/business/spots/new"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <Plus className="h-4 w-4 text-muted-foreground text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-teal-950">
                    Add New Spot
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Register a new location
                  </p>
                </div>
              </Link>

              <Link
                href="/business/spots"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <MapPin className="h-4 w-4 text-muted-foreground text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-teal-950">
                    Manage Spots
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Edit your locations
                  </p>
                </div>
              </Link>

              <Link
                href="/business/reviews"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-teal-950">
                    View Reviews
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Customer feedback
                  </p>
                </div>
              </Link>

              <Link
                href="/business/profile"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <Eye className="h-4 w-4 text-muted-foreground text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-teal-950">
                    Update Profile
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Business information
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.recentReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest reviews and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">New reviews received</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.recentReviews} reviews this week
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </BusinessLayout>
  )
}

