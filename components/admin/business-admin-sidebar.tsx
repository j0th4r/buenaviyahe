'use client'

import * as React from 'react'
import {
  Building2,
  MapPin,
  MessageSquare,
  BarChart3,
  Settings,
  Home,
} from 'lucide-react'

import { BusinessNavMain } from '@/components/admin/business-nav-main'
import { BusinessNavSecondary } from '@/components/admin/business-nav-secondary'
import { BusinessNavUser } from '@/components/admin/business-nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const getNavigation = () => ({
  navMain: [
    {
      title: 'Dashboard',
      url: '/business',
      icon: Home,
    },
    {
      title: 'My Spots',
      url: '/business/spots',
      icon: MapPin,
    },
    {
      title: 'Reviews',
      url: '/business/reviews',
      icon: MessageSquare,
    },
    {
      title: 'Analytics',
      url: '/business/analytics',
      icon: BarChart3,
    },
  ],
  navSecondary: [
    {
      title: 'Profile Settings',
      url: '/business/profile',
      icon: Settings,
    },
  ],
})

interface BusinessAdminSidebarProps
  extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function BusinessAdminSidebar({
  user,
  ...props
}: BusinessAdminSidebarProps) {
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
              <a href="/business">
                <Building2 className="!size-5 text-teal-600" />
                <span className="text-base font-semibold text-teal-950">
                  Business Admin
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <BusinessNavMain items={navigation.navMain} />
        <BusinessNavSecondary
          items={navigation.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <BusinessNavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
