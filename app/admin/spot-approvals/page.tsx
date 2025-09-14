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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Building2,
  User,
  Calendar,
  Star,
  AlertTriangle,
  FileText,
  Camera,
} from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/config'

// Extended spot data with status field
type SpotWithStatus = {
  id: string
  title: string
  slug: string
  location: string
  description: string
  tags: string[]
  images: string[]
  rating: number
  reviews: number
  pricing: any
  amenities: string[]
  lat?: number
  lng?: number
  owner_id?: string
  created_at: string
  updated_at: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string | null
  submitter?: {
    id: string
    name: string
    avatar_url?: string
    role: string
  }
}

async function getSpotProposals(): Promise<SpotWithStatus[]> {
  const supabase = createServiceClient()

  try {
    // Get spots with owner information
    const { data: spots, error } = await supabase
      .from('spots')
      .select(
        `
        *,
        profiles!spots_owner_id_fkey (
          id,
          name,
          avatar_url,
          role
        )
      `
      )
      .not('owner_id', 'is', null)
      .order('submitted_at', { ascending: false, nullsFirst: false })

    if (error) throw error

    // Return spots with their actual status from the database
    return (spots || []).map((spot) => ({
      ...spot,
      status: spot.status || 'pending', // Default to pending if status is null
      submitted_at: spot.submitted_at || spot.created_at,
      submitter: spot.profiles
        ? {
            id: spot.profiles.id,
            name: spot.profiles.name,
            avatar_url: spot.profiles.avatar_url,
            role: spot.profiles.role,
          }
        : undefined,
    })) as SpotWithStatus[]
  } catch (error) {
    console.error('Error fetching spot proposals:', error)
    return []
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

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="border-orange-200 text-orange-700"
        >
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant="default" className="bg-green-700 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      )
    default:
      return null
  }
}

import { SpotApprovalCard } from '@/components/admin/spot-approval-card'
import { Toaster } from '@/components/ui/toaster'

export default async function SpotApprovalsPage() {
  const adminUser = await requireAdmin()
  const spots = await getSpotProposals()

  // Transform admin user data for sidebar
  const sidebarUser = {
    name: adminUser.profile.name,
    email: adminUser.email,
    avatar: adminUser.profile.avatar_url || '/placeholder-user.jpg',
  }

  const pendingSpots = spots.filter(
    (spot) => spot.status === 'pending'
  )
  const approvedSpots = spots.filter(
    (spot) => spot.status === 'approved'
  )
  const rejectedSpots = spots.filter(
    (spot) => spot.status === 'rejected'
  )

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
                      Spot Approvals
                    </h1>
                    <p className="text-muted-foreground">
                      Review and approve tourism spot proposals from
                      business owners
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-teal-950">
                        Pending Review
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {pendingSpots.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Awaiting approval
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-teal-950">
                        Approved
                      </CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {approvedSpots.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Live on platform
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-teal-950">
                        Rejected
                      </CardTitle>
                      <XCircle className="h-4 w-4 text-muted-foreground text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {rejectedSpots.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Not approved
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-teal-950">
                        Total Submissions
                      </CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground text-teal-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {spots.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        All proposals
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="px-4 lg:px-6">
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search proposals..."
                          className="pl-8"
                        />
                      </div>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            All Status
                          </SelectItem>
                          <SelectItem value="pending">
                            Pending
                          </SelectItem>
                          <SelectItem value="approved">
                            Approved
                          </SelectItem>
                          <SelectItem value="rejected">
                            Rejected
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by submitter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            All Submitters
                          </SelectItem>
                          <SelectItem value="business_owner">
                            Business Owners
                          </SelectItem>
                          <SelectItem value="user">
                            Regular Users
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Proposals Tabs */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-teal-950">
                      Spot Proposals
                    </CardTitle>
                    <CardDescription>
                      Review tourism spot submissions and manage
                      approvals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="pending" className="w-full">
                      <TabsList>
                        <TabsTrigger
                          value="pending"
                          className="flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4" />
                          Pending ({pendingSpots.length})
                        </TabsTrigger>
                        <TabsTrigger
                          value="approved"
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approved ({approvedSpots.length})
                        </TabsTrigger>
                        <TabsTrigger
                          value="rejected"
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Rejected ({rejectedSpots.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent
                        value="pending"
                        className="space-y-4"
                      >
                        {pendingSpots.length === 0 ? (
                          <div className="text-center py-12">
                            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                            <h3 className="text-lg font-medium text-teal-950 mb-2">
                              All caught up!
                            </h3>
                            <p className="text-muted-foreground">
                              No pending spot proposals to review
                            </p>
                          </div>
                        ) : (
                          pendingSpots.map((spot) => (
                            <SpotApprovalCard
                              key={spot.id}
                              spot={spot}
                            />
                          ))
                        )}
                      </TabsContent>

                      <TabsContent
                        value="approved"
                        className="space-y-4"
                      >
                        {approvedSpots.map((spot) => (
                          <SpotApprovalCard
                            key={spot.id}
                            spot={spot}
                          />
                        ))}
                      </TabsContent>

                      <TabsContent
                        value="rejected"
                        className="space-y-4"
                      >
                        {rejectedSpots.map((spot) => (
                          <SpotApprovalCard
                            key={spot.id}
                            spot={spot}
                          />
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Approval Guidelines */}
              <div className="px-4 lg:px-6">
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-teal-950">
                      Approval Guidelines
                    </CardTitle>
                    <CardDescription>
                      Criteria for evaluating tourism spot proposals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <h4 className="font-medium text-green-700 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Approval Criteria
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>✓ Valid business permits and licenses</p>
                          <p>✓ Location within LGU jurisdiction</p>
                          <p>
                            ✓ Meets safety and accessibility standards
                          </p>
                          <p>✓ Environmental compliance</p>
                          <p>✓ Complete and accurate information</p>
                          <p>✓ Quality photos and descriptions</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-red-700 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Rejection Reasons
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>✗ Missing or invalid permits</p>
                          <p>✗ Location outside LGU boundaries</p>
                          <p>✗ Safety or environmental concerns</p>
                          <p>✗ Incomplete or false information</p>
                          <p>
                            ✗ Poor quality or inappropriate content
                          </p>
                          <p>✗ Conflicts with existing regulations</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-teal-950">
                            Important Reminder
                          </p>
                          <p className="text-sm text-teal-700 mt-1">
                            All approvals should align with local
                            tourism development plans and regulations.
                            Consider the impact on local communities
                            and environmental sustainability when
                            reviewing proposals.
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
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
