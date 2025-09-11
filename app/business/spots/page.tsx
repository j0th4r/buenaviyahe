import { requireBusinessOwner } from '@/lib/auth/admin'
import { BusinessLayout } from '@/components/admin/business-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Edit, Plus, Eye, Calendar } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/config'
import { getImageUrl } from '@/lib/utils/image'
import Link from 'next/link'
import Image from 'next/image'

async function getBusinessSpots(ownerId: string) {
  const supabase = createServiceClient()

  try {
    const { data: spots } = await supabase
      .from('spots')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    return spots || []
  } catch (error) {
    console.error('Error fetching business spots:', error)
    return []
  }
}

export default async function BusinessSpots() {
  const user = await requireBusinessOwner()
  const spots = await getBusinessSpots(user.id)

  return (
    <BusinessLayout user={user}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-teal-950">
            My Spots
          </h1>
          <p className="text-muted-foreground">
            Manage your registered locations
          </p>
        </div>
        <Link href="/business/spots/new">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Spot
          </Button>
        </Link>
      </div>

      {spots.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-lg font-semibold mb-2">
              No spots registered yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by adding your first tourist spot. Share
              your amazing location with travelers around the world.
            </p>
            <Link href="/business/spots/new">
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Spot
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {spots.map((spot) => (
            <Card key={spot.id} className="overflow-hidden">
              <div className="aspect-video relative">
                {spot.images && spot.images.length > 0 ? (
                  <Image
                    src={
                      getImageUrl(spot.images[0]) ||
                      '/placeholder-user.jpg'
                    }
                    alt={spot.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="secondary"
                    className="bg-background/80"
                  >
                    <Star className="h-3 w-3 mr-1 text-yellow-500" />
                    {spot.rating || 'No ratings'}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">
                  {spot.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {spot.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">
                    {spot.location}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Added{' '}
                    {new Date(spot.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {spot.tags?.slice(0, 3).map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {spot.tags && spot.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{spot.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/business/spots/${spot.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/spots/${spot.slug}`} target="_blank">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </BusinessLayout>
  )
}
