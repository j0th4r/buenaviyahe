import { requireAdmin } from '@/lib/auth/admin'
import { LguAdminSidebar } from '@/components/admin/lgu-admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { LguMetricsCards } from '@/components/admin/lgu-metrics-cards'
import { TourismActivityChart } from '@/components/admin/tourism-activity-chart'
import { LguSpotsTable } from '@/components/admin/lgu-spots-table'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { createServiceClient } from '@/lib/supabase/config'
import {
  SpotSubmission,
  LguDashboardData,
  RecentActivity,
} from '@/types/admin'

async function getRecentActivities(
  supabase: any
): Promise<RecentActivity[]> {
  try {
    const activities: RecentActivity[] = []

    // Get recent business registrations
    const { data: recentBusinesses } = await supabase
      .from('profiles')
      .select('name, created_at')
      .eq('role', 'business_owner')
      .order('created_at', { ascending: false })
      .limit(3)

    recentBusinesses?.forEach((business: any) => {
      activities.push({
        type: 'business_registration',
        message: `New business "${business.name}" registered`,
        timestamp: business.created_at,
      })
    })

    // Get recent spot approvals
    const { data: recentApprovals } = await supabase
      .from('spots')
      .select('title, updated_at, status')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(3)

    recentApprovals?.forEach((spot: any) => {
      activities.push({
        type: 'spot_approval',
        message: `Spot "${spot.title}" approved`,
        timestamp: spot.updated_at,
      })
    })

    // Get recent user registrations
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('name, created_at')
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(2)

    recentUsers?.forEach((user: any) => {
      activities.push({
        type: 'user_registration',
        message: `New user "${user.name}" joined`,
        timestamp: user.created_at,
      })
    })

    // Sort all activities by timestamp
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      )
      .slice(0, 5)
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }
}

async function getLGUDashboardData(): Promise<LguDashboardData> {
  const supabase = createServiceClient()

  try {
    // Get business owner count
    const { count: businessOwnersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'business_owner')

    // Get regular users count
    const { count: regularUsersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')

    // Get total spots count
    const { count: totalSpots } = await supabase
      .from('spots')
      .select('*', { count: 'exact', head: true })

    // Get spot counts by status for real approval metrics
    const { count: pendingSpotsCount } = await supabase
      .from('spots')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: approvedSpotsCount } = await supabase
      .from('spots')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    const { count: rejectedSpotsCount } = await supabase
      .from('spots')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')

    // Get recent business registrations (last 30 days)
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString()
    const { count: recentBusinessRegistrations } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'business_owner')
      .gte('created_at', thirtyDaysAgo)

    // Get recent spot submissions for the table (ordered by submission date)
    const { data: recentSpots, error: spotsError } = await supabase
      .from('spots')
      .select(
        `
        id, 
        title, 
        location, 
        created_at, 
        submitted_at,
        updated_at,
        owner_id,
        description,
        status,
        profiles!spots_owner_id_fkey(name)
      `
      )
      .not('owner_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (spotsError) {
      console.error('Error fetching recent spots:', spotsError)
    }

    // Transform spots data for the table
    const spotsWithStatus: SpotSubmission[] = (recentSpots || []).map(
      (spot) => ({
        id: spot.id,
        title: spot.title,
        location: spot.location,
        status: spot.status || 'pending', // Use actual status from DB
        submittedAt: spot.submitted_at || spot.created_at,
        submittedBy: (spot.profiles as any)?.name || 'Unknown',
        description: spot.description || '',
      })
    )

    // Get recent activities for the dashboard
    const recentActivities = await getRecentActivities(supabase)

    return {
      stats: {
        businessOwnersCount: businessOwnersCount || 0,
        regularUsersCount: regularUsersCount || 0,
        totalSpots: totalSpots || 0,
        pendingSpotsCount: pendingSpotsCount || 0,
        approvedSpotsCount: approvedSpotsCount || 0,
        rejectedSpotsCount: rejectedSpotsCount || 0,
        recentBusinessRegistrations: recentBusinessRegistrations || 0,
      },
      spotsData: spotsWithStatus,
      recentActivities,
    }
  } catch (error) {
    console.error('Error fetching LGU dashboard data:', error)
    return {
      stats: {
        businessOwnersCount: 0,
        regularUsersCount: 0,
        totalSpots: 0,
        pendingSpotsCount: 0,
        approvedSpotsCount: 0,
        rejectedSpotsCount: 0,
        recentBusinessRegistrations: 0,
      },
      spotsData: [],
      recentActivities: [],
    }
  }
}

function formatRelativeTime(timestamp: string) {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    return `${diffDays}d ago`
  }
}

export default async function LGUAdminDashboard() {
  const adminUser = await requireAdmin()
  const { stats, spotsData, recentActivities } =
    await getLGUDashboardData()

  // Transform admin user data for sidebar
  const sidebarUser = {
    name: adminUser.profile.name,
    email: adminUser.email,
    avatar: adminUser.profile.avatar_url || '/placeholder-user.jpg',
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
              {/* Metrics Cards */}
              <LguMetricsCards stats={stats} />

              {/* Tourism Activity Chart */}
              <div className="px-4 lg:px-6">
                <TourismActivityChart />
              </div>

              {/* Spots Table */}
              <div className="px-4 lg:px-6">
                <LguSpotsTable data={spotsData} />
              </div>

              {/* Additional Quick Actions Section */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border p-6">
                    <h3 className="font-semibold text-teal-950 mb-2">
                      Approval Overview
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-teal-950">
                          Approved Spots
                        </span>
                        <span className="font-medium text-green-600">
                          {stats.approvedSpotsCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-teal-950">
                          Pending Review
                        </span>
                        <span
                          className={`font-medium ${stats.pendingSpotsCount > 0 ? 'text-orange-600' : 'text-green-600'}`}
                        >
                          {stats.pendingSpotsCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-teal-950">
                          Approval Rate
                        </span>
                        <span className="font-medium text-green-600">
                          {stats.totalSpots > 0
                            ? Math.round(
                                (stats.approvedSpotsCount /
                                  stats.totalSpots) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-6">
                    <h3 className="font-semibold text-blue-950 mb-2">
                      Recent Activity
                    </h3>
                    <div className="space-y-2 text-sm">
                      {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                          <div key={index} className="text-teal-950">
                            • {activity.message} (
                            {formatRelativeTime(activity.timestamp)})
                          </div>
                        ))
                      ) : (
                        <div className="text-teal-950">
                          • No recent activity to display
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border p-6">
                    <h3 className="font-semibold text-green-950 mb-2">
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="/admin/business-registration"
                        className="block text-sm text-teal-950 hover:text-teal-600 hover:underline"
                      >
                        → Register New Business
                      </a>
                      <a
                        href="/admin/spot-approvals"
                        className="block text-sm text-teal-950 hover:text-teal-600 hover:underline"
                      >
                        → Review Pending Spots{' '}
                        {stats.pendingSpotsCount > 0 &&
                          `(${stats.pendingSpotsCount})`}
                      </a>
                      <a
                        href="/admin/user-management"
                        className="block text-sm text-teal-950 hover:text-teal-600 hover:underline"
                      >
                        → Manage User Roles
                      </a>
                    </div>
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
