import { ReactNode } from 'react'
import { AdminUser } from '@/lib/auth/admin'
import { BusinessAdminSidebar } from '@/components/admin/business-admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

interface BusinessLayoutProps {
  children: ReactNode
  user: AdminUser
}

export function BusinessLayout({
  children,
  user,
}: BusinessLayoutProps) {
  // Transform user data for sidebar
  const sidebarUser = {
    name: user.profile.name,
    email: user.email,
    avatar: user.profile.avatar_url || '/placeholder-user.jpg',
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
      <BusinessAdminSidebar variant="inset" user={sidebarUser} />
      <SidebarInset>
        <AdminHeader
          title="Business Admin"
          subtitle="Business Management System"
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">{children}</div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
