'use client'

import * as React from 'react'
import {
  Building2,
  CheckCircle,
  FileText,
  Home,
  Settings,
  TrendingUp,
  Users,
  UserPlus,
  Shield,
  HelpCircle,
} from 'lucide-react'

import { LguNavMain } from '@/components/admin/lgu-nav-main'
import { LguNavSecondary } from '@/components/admin/lgu-nav-secondary'
import { LguNavUser } from '@/components/admin/lgu-nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { LguUser } from '@/types/admin'

const getNavigation = () => ({
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: Home,
    },
    {
      title: 'Reports',
      url: '/admin/reports',
      icon: FileText,
    },
    {
      title: 'Spot Approvals',
      url: '/admin/spot-approvals',
      icon: CheckCircle,
    },
    {
      title: 'Business Details',
      url: '/admin/business-details',
      icon: Building2,
    },
    {
      title: 'User Management',
      url: '/admin/user-management',
      icon: Users,
    },
    {
      title: 'Business Registration',
      url: '/admin/business-registration',
      icon: UserPlus,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: Settings,
    },
  ],
})

interface LguAdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: LguUser
}

export function LguAdminSidebar({
  user,
  ...props
}: LguAdminSidebarProps) {
  const navigation = getNavigation()
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin">
                <Shield className="!size-5 text-teal-600" />
                <span className="text-base font-semibold text-teal-950">
                  LGU Admin
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <LguNavMain items={navigation.navMain} />
        <LguNavSecondary
          items={navigation.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <LguNavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
