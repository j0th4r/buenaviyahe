import { requireAdmin } from '@/lib/auth/admin'
import { SettingsClient } from './settings-client'
import { LguAdminSidebar } from '@/components/admin/lgu-admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

export default async function SettingsPage() {
  const adminUser = await requireAdmin()

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
          <SettingsClient />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
