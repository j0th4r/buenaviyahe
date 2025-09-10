import { requireAdmin } from '@/lib/auth/admin'
import { AdminLayout } from '@/components/admin/admin-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Search,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Reply,
  Filter,
} from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/config'

async function getReviews() {
  const supabase = createServiceClient()

  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        spots (
          id,
          title,
          slug,
          images
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return reviews || []
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

async function getReviewsStats() {
  const supabase = createServiceClient()

  try {
    // Get all reviews for stats
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, created_at')

    const total = reviews?.length || 0
    const avgRating = reviews?.length
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
        reviews.length
      : 0

    // Get pending reviews (recent ones without responses)
    const weekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString()
    const { count: pendingCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo)

    // Calculate response rate (mock for now)
    const responseRate = 87 // This would be calculated based on actual responses

    return {
      total,
      avgRating: Math.round(avgRating * 10) / 10,
      pending: pendingCount || 0,
      responseRate,
    }
  } catch (error) {
    console.error('Error fetching review stats:', error)
    return {
      total: 0,
      avgRating: 0,
      pending: 0,
      responseRate: 0,
    }
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStarRating(rating: number | null) {
  const stars = rating || 0
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= stars
              ? 'fill-current text-yellow-400'
              : 'text-muted-foreground'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">
        ({stars})
      </span>
    </div>
  )
}

export default async function ReviewsPage() {
  const user = await requireAdmin()
  const reviews = await getReviews()
  const stats = await getReviewsStats()

  // Separate reviews by status for tabs
  const pendingReviews = reviews.filter((review) => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return new Date(review.created_at).getTime() > weekAgo
  })

  const respondedReviews = reviews.filter((review) => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return new Date(review.created_at).getTime() <= weekAgo
  })

  return (
    <AdminLayout user={user}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-teal-950">
            Reviews
          </h1>
          <p className="text-muted-foreground">
            Manage customer feedback and responses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-950">
              Total Reviews
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
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
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Need response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-950">
              Response Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.responseRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-teal-950">
            Review Inbox
          </CardTitle>
          <CardDescription>
            Manage and respond to customer reviews
          </CardDescription>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                className="pl-8"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList>
              <TabsTrigger
                value="pending"
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Pending ({pendingReviews.length})
              </TabsTrigger>
              <TabsTrigger
                value="responded"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Responded ({respondedReviews.length})
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                All Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingReviews.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-700" />
                  <p className="text-muted-foreground">
                    No pending reviews
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                pendingReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isPending={true}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="responded" className="space-y-4">
              {respondedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isPending={false}
                />
              ))}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isPending={false}
                />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

function ReviewCard({
  review,
  isPending,
}: {
  review: any
  isPending: boolean
}) {
  return (
    <Card
      className={isPending ? 'border-teal-200 bg-teal-50/50' : ''}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user_avatar} />
            <AvatarFallback>
              {review.user_name
                .split(' ')
                .map((n: string) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-teal-950">
                  {review.user_name}
                </p>
                <div className="flex items-center gap-2">
                  {getStarRating(review.rating)}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{formatDate(review.created_at)}</p>
                {review.spots && (
                  <p className="text-xs">{review.spots.title}</p>
                )}
              </div>
            </div>

            <p className="text-sm text-teal-900">{review.comment}</p>

            {isPending && (
              <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-2">
                  <Reply className="h-4 w-4" />
                  <span className="font-medium text-teal-950">
                    Respond to Review
                  </span>
                </div>
                <Textarea
                  placeholder="Write your response..."
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Send Response
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-teal-200 text-teal-700 hover:bg-teal-50"
                  >
                    Save Draft
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
