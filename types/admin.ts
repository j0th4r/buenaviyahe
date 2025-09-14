import { LucideIcon } from 'lucide-react'

export interface LguDashboardStats {
  businessOwnersCount: number
  regularUsersCount: number
  totalSpots: number
  pendingSpotsCount: number
  approvedSpotsCount: number
  rejectedSpotsCount: number
  recentBusinessRegistrations: number
}

export interface SpotSubmission {
  id: string
  title: string
  location: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  submittedBy: string
  description: string
}

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  badge?: string
}

export interface NavManagementItem {
  title: string
  url: string
  icon: LucideIcon
  items?: {
    title: string
    url: string
  }[]
}

export interface LguUser {
  name: string
  email: string
  avatar: string
}

export interface RecentActivity {
  type:
    | 'business_registration'
    | 'spot_approval'
    | 'user_registration'
  message: string
  timestamp: string
}

export interface LguDashboardData {
  stats: LguDashboardStats
  spotsData: SpotSubmission[]
  recentActivities: RecentActivity[]
}

export interface TourismChartData {
  date: string
  visitors: number
  registrations: number
}

export interface ComplianceStatus {
  permits: number
  licenses: number
  inspections: number
  clearances: string
}

export interface NotificationItem {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  type: 'info' | 'warning' | 'success' | 'error'
}

// Error types for better error handling
export interface LguDashboardError {
  code: string
  message: string
  details?: string
}

export type LguDashboardResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: LguDashboardError
    }
