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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
} from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/config'
import Link from 'next/link'

async function getListings() {
  const supabase = createServiceClient()

  try {
    const { data: spots, error } = await supabase
      .from('spots')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return spots || []
  } catch (error) {
    console.error('Error fetching listings:', error)
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

function getStatusBadge(rating: number, reviews: number) {
  if (reviews === 0) return <Badge variant="secondary">New</Badge>
  if (rating >= 4.5) return <Badge variant="default" className='bg-green-700 text-white'>Approved</Badge>
  if (rating >= 4.0) return <Badge variant="secondary">Good</Badge>
  if (rating >= 3.0) return <Badge variant="outline">Average</Badge>
  return <Badge variant="destructive">Needs Attention</Badge>
}

export default async function ListingsPage() {
  const user = await requireAdmin()
  const listings = await getListings()

  return (
    <AdminLayout user={user}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-teal-950">
            Listings
          </h1>
          <p className="text-muted-foreground">
            Manage your tourist spot listings
          </p>
        </div>
        <Button asChild className="bg-teal-500 hover:bg-teal-800 text-white">
          <Link href="/admin/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-teal-950'>All Listings</CardTitle>
          <CardDescription>
            View and manage all your tourist spot listings
          </CardDescription>
          {/* <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                className="pl-8"
              />
            </div>
          </div> */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-teal-950'>Name</TableHead>
                <TableHead className='text-teal-950'>Location</TableHead>
                <TableHead className='text-teal-950'>Rating</TableHead>
                <TableHead className='text-teal-950'>Reviews</TableHead>
                <TableHead className='text-teal-950'>Status</TableHead>
                <TableHead className='text-teal-950'>Created</TableHead>
                <TableHead className="text-right text-teal-950">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground">
                        No listings found
                      </p>
                      <Button asChild variant="outline">
                        <Link href="/admin/listings/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Create your first listing
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">
                            {listing.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {listing.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{listing.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                        <span>{listing.rating || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>{listing.reviews}</TableCell>
                    <TableCell>
                      {getStatusBadge(
                        listing.rating || 0,
                        listing.reviews
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(listing.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/spots/${listing.slug}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/listings/${listing.id}`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
