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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Star, MessageSquare, Calendar, MapPin } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/config'
import { DeleteReviewButton } from '@/components/business/delete-review-button'

async function getBusinessReviews(ownerId: string) {
  const supabase = createServiceClient()

  try {
    // First get all spots owned by this business owner
    const { data: spots } = await supabase
      .from('spots')
      .select('id, title')
      .eq('owner_id', ownerId)

    if (!spots || spots.length === 0) {
      return []
    }

    // Then get all reviews for those spots
    const { data: reviews } = await supabase
      .from('reviews')
      .select(
        `
        *,
        spots!inner(title, slug)
      `
      )
      .in(
        'spot_id',
        spots.map((spot) => spot.id)
      )
      .order('created_at', { ascending: false })

    return reviews || []
  } catch (error) {
    console.error('Error fetching business reviews:', error)
    return []
  }
}

export default async function BusinessReviews() {
  const user = await requireBusinessOwner()
  const reviews = await getBusinessReviews(user.id)

  const avgRating =
    reviews.length > 0
      ? reviews.reduce(
          (acc, review) => acc + (review.rating || 0),
          0
        ) / reviews.length
      : 0

  const ratingDistribution = reviews.reduce(
    (acc, review) => {
      const rating = review.rating || 0
      acc[rating] = (acc[rating] || 0) + 1
      return acc
    },
    {} as Record<number, number>
  )

  return (
    <BusinessLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-teal-950">
            Reviews
          </h1>
          <p className="text-muted-foreground">
            Customer feedback for your spots
          </p>
        </div>

        {/* Review Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-950">
                Total Reviews
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reviews.length}
              </div>
              <p className="text-xs text-muted-foreground">
                From all your spots
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
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of 5 stars
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-950">
                Rating Distribution
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div
                    key={rating}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-3">{rating}</span>
                    <div className="flex-1 bg-muted rounded h-2">
                      <div
                        className="bg-teal-600 h-2 rounded"
                        style={{
                          width:
                            reviews.length > 0
                              ? `${((ratingDistribution[rating] || 0) / reviews.length) * 100}%`
                              : '0%',
                        }}
                      />
                    </div>
                    <span className="w-6 text-right">
                      {ratingDistribution[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-lg font-semibold mb-2">
                No reviews yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                When customers visit your spots and leave reviews,
                they'll appear here. Great reviews help attract more
                visitors!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user_avatar} />
                        <AvatarFallback>
                          {review.user_name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {review.user_name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(
                            review.created_at
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {review.rating}
                      </Badge>
                      <DeleteReviewButton reviewId={review.id} />
                    </div>
                  </div>

                  {/* Show which spot this review is for */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <MapPin className="h-3 w-3" />
                    <span>
                      Review for: {(review as any).spots?.title}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </BusinessLayout>
  )
}
