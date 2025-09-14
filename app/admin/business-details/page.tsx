import { requireAdmin } from '@/lib/auth/admin'
import { LguAdminSidebar } from '@/components/admin/lgu-admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Search,
  Building2,
  MapPin,
  Star,
  Eye,
  Calendar,
  Globe,
  Phone,
  Mail,
  Users,
  TrendingUp,
  MessageSquare,
  Camera,
  CheckCircle,
  AlertTriangle,
  DollarSign,
} from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/config'
import { getImageUrl } from '@/lib/utils/image'

type BusinessOwnerWithSpots = {
  id: string
  name: string
  city: string
  website?: string
  about: string
  role: string
  joined_year: number
  contributions: number
  avatar_url?: string
  created_at: string
  updated_at: string
  spots: Array<{
    id: string
    title: string
    location: string
    rating: number
    reviews: number
    images: string[]
    created_at: string
    pricing: any
  }>
}

async function getBusinessDetails(): Promise<
  BusinessOwnerWithSpots[]
> {
  const supabase = createServiceClient()

  try {
    // Get business owners with their spots
    const { data: businessOwners, error } = await supabase
      .from('profiles')
      .select(
        `
        *,
        spots!spots_owner_id_fkey (
          id,
          title,
          location,
          rating,
          reviews,
          images,
          created_at,
          pricing
        )
      `
      )
      .eq('role', 'business_owner')
      .order('created_at', { ascending: false })

    if (error) throw error
    return businessOwners || []
  } catch (error) {
    console.error('Error fetching business details:', error)
    return []
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getBusinessStatusBadge(
  spotsCount: number,
  totalReviews: number
) {
  if (spotsCount === 0) {
    return (
      <Badge
        variant="outline"
        className="border-gray-200 text-gray-700"
      >
        <AlertTriangle className="h-3 w-3 mr-1" />
        No Listings
      </Badge>
    )
  }
  if (totalReviews >= 10) {
    return (
      <Badge variant="default" className="bg-green-700 text-white">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="border-blue-200 text-blue-700"
    >
      <TrendingUp className="h-3 w-3 mr-1" />
      Growing
    </Badge>
  )
}

function BusinessDetailModal({
  business,
}: {
  business: BusinessOwnerWithSpots
}) {
  const totalReviews = business.spots.reduce(
    (sum, spot) => sum + spot.reviews,
    0
  )
  const avgRating =
    business.spots.length > 0
      ? business.spots.reduce((sum, spot) => sum + spot.rating, 0) /
        business.spots.length
      : 0

  return (
    <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={business.avatar_url} />
            <AvatarFallback>
              {business.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-teal-950">
              {business.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {business.city}
            </p>
          </div>
        </DialogTitle>
        <DialogDescription>
          Detailed business information and tourism spot portfolio
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Business Overview */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium">
                  Tourism Spots
                </span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {business.spots.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium">
                  Total Reviews
                </span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {totalReviews}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium">
                  Average Rating
                </span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {avgRating.toFixed(1)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium">
                  Member Since
                </span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {business.joined_year}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-teal-950">
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Business Name
                </label>
                <p className="text-sm">{business.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Location
                </label>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <p className="text-sm">{business.city}</p>
                </div>
              </div>
              {business.website && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Website
                  </label>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {business.website}
                    </a>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Registration Date
                </label>
                <p className="text-sm">
                  {formatDate(business.created_at)}
                </p>
              </div>
            </div>

            {business.about && (
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">
                  About
                </label>
                <p className="text-sm mt-1">{business.about}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tourism Spots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-teal-950">
              Tourism Spots Portfolio
            </CardTitle>
            <CardDescription>
              All tourism spots managed by this business
            </CardDescription>
          </CardHeader>
          <CardContent>
            {business.spots.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No tourism spots submitted yet
                </p>
                <p className="text-sm text-muted-foreground">
                  This business owner hasn't created any listings
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {business.spots.map((spot) => (
                  <div
                    key={spot.id}
                    className="flex items-center gap-4 p-4 border rounded-lg overflow-hidden"
                  >
                    {/* Spot Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {spot.images && spot.images.length > 0 ? (
                        <img
                          src={getImageUrl(spot.images[0], {
                            width: 64,
                            height: 64,
                            quality: 80,
                          })}
                          alt={spot.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Spot Details */}
                    <div className="flex-1">
                      <h4 className="font-medium text-teal-950">
                        {spot.title}
                      </h4>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{spot.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <span>{spot.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{spot.reviews} reviews</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Added {formatDate(spot.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        {business.spots.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-teal-950">
                Business Performance
              </CardTitle>
              <CardDescription>
                Key metrics and analytics for this business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <p className="text-2xl font-bold text-teal-700">
                      {avgRating.toFixed(1)}
                    </p>
                    <p className="text-sm text-teal-600">
                      Average Rating
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">
                      {totalReviews}
                    </p>
                    <p className="text-sm text-blue-600">
                      Total Reviews
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">
                      {business.contributions}
                    </p>
                    <p className="text-sm text-green-600">
                      Platform Contributions
                    </p>
                  </div>
                </div>

                {/* Top Performing Spot */}
                {business.spots.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-teal-950 mb-2">
                      Top Performing Spot
                    </h5>
                    {(() => {
                      const topSpot = business.spots.reduce(
                        (prev, current) =>
                          prev.rating > current.rating
                            ? prev
                            : current
                      )
                      return (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                            {topSpot.images &&
                            topSpot.images.length > 0 ? (
                              <img
                                src={getImageUrl(topSpot.images[0], {
                                  width: 40,
                                  height: 40,
                                  quality: 80,
                                })}
                                alt={topSpot.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Camera className="h-3 w-3 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {topSpot.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-current text-yellow-400" />
                              <span>
                                {topSpot.rating} ({topSpot.reviews}{' '}
                                reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DialogContent>
  )
}

export default async function BusinessDetailsPage() {
  const adminUser = await requireAdmin()
  const businesses = await getBusinessDetails()

  // Transform admin user data for sidebar
  const sidebarUser = {
    name: adminUser.profile.name,
    email: adminUser.email,
    avatar: adminUser.profile.avatar_url || '/placeholder-user.jpg',
  }

  const stats = {
    totalBusinesses: businesses.length,
    totalSpots: businesses.reduce(
      (sum, b) => sum + b.spots.length,
      0
    ),
    totalReviews: businesses.reduce(
      (sum, b) =>
        sum +
        b.spots.reduce((spotSum, spot) => spotSum + spot.reviews, 0),
      0
    ),
    activeBusinesses: businesses.filter((b) => b.spots.length > 0)
      .length,
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 16)',
        } as React.CSSProperties
      }
    >
      <LguAdminSidebar variant="inset" user={sidebarUser} />
      <SidebarInset>
        <AdminHeader
          title="Local Government Unit Admin"
          subtitle="Tourism Management System"
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-teal-950">
                      Business Details
                    </h1>
                    <p className="text-muted-foreground">
                      Detailed view of business owners and their
                      tourism spot portfolios
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-teal-950">
                        Total Businesses
                      </CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground text-teal-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalBusinesses}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Registered business owners
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-teal-950">
                        Active Businesses
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.activeBusinesses}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        With tourism spots
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-teal-950">
                        Total Spots
                      </CardTitle>
                      <MapPin className="h-4 w-4 text-muted-foreground text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalSpots}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Across all businesses
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-teal-950">
                        Total Reviews
                      </CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalReviews}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Customer feedback
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Business Directory */}
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-teal-950">
                        Business Directory
                      </CardTitle>
                      <CardDescription>
                        Comprehensive view of all registered business
                        owners
                      </CardDescription>

                      {/* Filters */}
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search businesses..."
                            className="pl-8"
                          />
                        </div>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              All Businesses
                            </SelectItem>
                            <SelectItem value="active">
                              Active (with spots)
                            </SelectItem>
                            <SelectItem value="inactive">
                              Inactive (no spots)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Select defaultValue="newest">
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">
                              Newest First
                            </SelectItem>
                            <SelectItem value="oldest">
                              Oldest First
                            </SelectItem>
                            <SelectItem value="most-spots">
                              Most Spots
                            </SelectItem>
                            <SelectItem value="highest-rated">
                              Highest Rated
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-teal-950">
                              Business
                            </TableHead>
                            <TableHead className="text-teal-950">
                              Location
                            </TableHead>
                            <TableHead className="text-teal-950">
                              Tourism Spots
                            </TableHead>
                            <TableHead className="text-teal-950">
                              Reviews
                            </TableHead>
                            <TableHead className="text-teal-950">
                              Status
                            </TableHead>
                            <TableHead className="text-teal-950">
                              Joined
                            </TableHead>
                            <TableHead className="text-right text-teal-950">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {businesses.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="text-center py-8"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <Building2 className="h-12 w-12 text-muted-foreground" />
                                  <p className="text-muted-foreground">
                                    No business owners found
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            businesses.map((business) => {
                              const totalReviews =
                                business.spots.reduce(
                                  (sum, spot) => sum + spot.reviews,
                                  0
                                )
                              const avgRating =
                                business.spots.length > 0
                                  ? business.spots.reduce(
                                      (sum, spot) =>
                                        sum + spot.rating,
                                      0
                                    ) / business.spots.length
                                  : 0

                              return (
                                <TableRow key={business.id}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage
                                          src={business.avatar_url}
                                        />
                                        <AvatarFallback className="text-xs">
                                          {business.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">
                                          {business.name}
                                        </p>
                                        {business.website && (
                                          <a
                                            href={business.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline"
                                          >
                                            Visit Website
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-muted-foreground" />
                                      <span>{business.city}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-center">
                                      <span className="font-medium">
                                        {business.spots.length}
                                      </span>
                                      {business.spots.length > 0 && (
                                        <div className="flex items-center gap-1 justify-center mt-1">
                                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                                          <span className="text-xs">
                                            {avgRating.toFixed(1)} avg
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="font-medium">
                                      {totalReviews}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {getBusinessStatusBadge(
                                      business.spots.length,
                                      totalReviews
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(business.created_at)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          View Details
                                        </Button>
                                      </DialogTrigger>
                                      <BusinessDetailModal
                                        business={business}
                                      />
                                    </Dialog>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                {/* Business Insights */}
                <div className="px-4 lg:px-6">
                  <div className="grid gap-6 md:grid-cols-2 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-teal-950">
                          Top Performing Businesses
                        </CardTitle>
                        <CardDescription>
                          Businesses with highest-rated tourism spots
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {businesses
                            .filter((b) => b.spots.length > 0)
                            .sort((a, b) => {
                              const aAvg =
                                a.spots.reduce(
                                  (sum, spot) => sum + spot.rating,
                                  0
                                ) / a.spots.length
                              const bAvg =
                                b.spots.reduce(
                                  (sum, spot) => sum + spot.rating,
                                  0
                                ) / b.spots.length
                              return bAvg - aAvg
                            })
                            .slice(0, 5)
                            .map((business, index) => {
                              const avgRating =
                                business.spots.reduce(
                                  (sum, spot) => sum + spot.rating,
                                  0
                                ) / business.spots.length
                              return (
                                <div
                                  key={business.id}
                                  className="flex items-center gap-4"
                                >
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-teal-50 text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={business.avatar_url}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {business.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {business.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {business.spots.length} spots
                                    </p>
                                  </div>
                                  <Badge variant="secondary">
                                    <Star className="h-3 w-3 mr-1 fill-current text-yellow-400" />
                                    {avgRating.toFixed(1)}
                                  </Badge>
                                </div>
                              )
                            })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-teal-950">
                          Business Growth Insights
                        </CardTitle>
                        <CardDescription>
                          Key metrics and growth indicators
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                            <div>
                              <p className="text-sm font-medium">
                                Active Business Rate
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(
                                  (stats.activeBusinesses /
                                    stats.totalBusinesses) *
                                  100
                                ).toFixed(1)}
                                % of businesses have submitted spots
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                            <div>
                              <p className="text-sm font-medium">
                                Average Spots per Business
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {stats.activeBusinesses > 0
                                  ? (
                                      stats.totalSpots /
                                      stats.activeBusinesses
                                    ).toFixed(1)
                                  : 0}{' '}
                                spots per active business
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                            <div>
                              <p className="text-sm font-medium">
                                Review Engagement
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {stats.totalSpots > 0
                                  ? (
                                      stats.totalReviews /
                                      stats.totalSpots
                                    ).toFixed(1)
                                  : 0}{' '}
                                reviews per spot on average
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
                            <div>
                              <p className="text-sm font-medium">
                                Platform Contribution
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Business owners contribute{' '}
                                {(
                                  (stats.totalSpots /
                                    (stats.totalSpots + 50)) *
                                  100
                                ).toFixed(1)}
                                % of all tourism spots
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
