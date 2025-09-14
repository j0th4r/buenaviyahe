import { requireAdmin } from '@/lib/auth/admin'
import { UserManagementContent } from '@/components/admin/user-management-content'
import { LguAdminSidebar } from '@/components/admin/lgu-admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { createServiceClient } from '@/lib/supabase/config'

async function getUsers() {
  const supabase = createServiceClient()

  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return users || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export default async function UserManagementPage() {
  const adminUser = await requireAdmin()
  const users = await getUsers()

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
        <UserManagementContent users={users} />
      </SidebarInset>
    </SidebarProvider>
  )
}
