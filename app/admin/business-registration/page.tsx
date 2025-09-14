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
import { BusinessRegistrationForm } from '@/components/admin/business-registration-form'
import { BusinessOwnersTable } from '@/components/admin/businesses-table'
import {
  UserPlus,
  Building2,
  Calendar,
  CheckCircle,
} from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/config'

async function getBusinessOwnersWithSpots() {
  const supabase = createServiceClient()

  try {
    const { data: businessOwners, error } = await supabase
      .from('profiles')
      .select(
        `
        *,
        spots!spots_owner_id_fkey(*)
      `
      )
      .eq('role', 'business_owner')
      .order('created_at', { ascending: false })

    if (error) throw error
    return businessOwners || []
  } catch (error) {
    console.error('Error fetching business owners:', error)
    return []
  }
}

async function getBusinessStats() {
  const supabase = createServiceClient()

  try {
    // Get total business owners
    const { count: totalOwners } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'business_owner')

    // Get business owners with spots (active)
    const { data: ownersWithSpots } = await supabase
      .from('profiles')
      .select('id, spots!spots_owner_id_fkey(id)')
      .eq('role', 'business_owner')

    const activeOwners =
      ownersWithSpots?.filter(
        (owner) => owner.spots && owner.spots.length > 0
      ).length || 0

    // Get business owners created this month
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const { count: newThisMonth } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'business_owner')
      .gte('created_at', monthAgo.toISOString())

    return {
      totalOwners: totalOwners || 0,
      activeOwners: activeOwners,
      newThisMonth: newThisMonth || 0,
    }
  } catch (error) {
    console.error('Error fetching business stats:', error)
    return {
      totalOwners: 0,
      activeOwners: 0,
      newThisMonth: 0,
    }
  }
}

export default async function BusinessRegistrationPage() {
  const adminUser = await requireAdmin()
  const businessOwners = await getBusinessOwnersWithSpots()
  const stats = await getBusinessStats()

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
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-teal-950">
                      Business Registration
                    </h1>
                    <p className="text-muted-foreground">
                      Register new business owners and manage existing
                      accounts
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Registration Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-teal-950 flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        New Business Registration
                      </CardTitle>
                      <CardDescription>
                        Create a new business owner account for
                        tourism operators
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BusinessRegistrationForm />
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-teal-950">
                          Registration Overview
                        </CardTitle>
                        <CardDescription>
                          Current business registration statistics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                              <Building2 className="h-6 w-6 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">
                                {stats.totalOwners}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Total Business Owners
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">
                                {stats.activeOwners}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Active Owners
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                              <Calendar className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">
                                {stats.newThisMonth}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                New This Month
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-teal-950">
                          Registration Guidelines
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            <p>
                              Verify business permits and licenses
                              before approval
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            <p>
                              Ensure business address is within LGU
                              jurisdiction
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            <p>
                              Collect complete contact information for
                              communication
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            <p>
                              Business owners can submit tourism spots
                              after approval
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Existing Business Owners Table */}
                <div className="px-4 lg:px-6">
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-teal-950">
                        Registered Business Owners
                      </CardTitle>
                      <CardDescription>
                        View and manage existing business owner
                        accounts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BusinessOwnersTable
                        businessOwners={businessOwners}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
