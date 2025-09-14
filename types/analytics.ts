import { z } from 'zod'

// Analytics data types
export interface AnalyticsChartData {
  date: string
  visitors: number
}

export interface BusinessTrend {
  date: string
  registrations: number
  spots: number
}

export interface SpotTrend {
  date: string
  submissions: number
  approvals: number
}

export interface CategoryTrend {
  category: string
  count: number
  approved: number
  pending: number
  rejected: number
  avgRating: number
  totalReviews: number
}

export interface SpotAnalytics {
  id: string
  title: string
  location: string
  status: 'pending' | 'approved' | 'rejected'
  rating: number
  reviews: number
  tags: string[]
  submittedAt: string
  submittedBy: string
  category: string
  performance: 'New' | 'Poor' | 'Fair' | 'Good' | 'Excellent'
}

export interface BusinessAnalytics {
  id: string
  name: string
  city: string
  joinedAt: string
  spotsCount: number
  approvedSpots: number
  pendingSpots: number
  avgRating: number
  totalReviews: number
  performance:
    | 'Inactive'
    | 'Starting'
    | 'Active'
    | 'Growing'
    | 'Leading'
}

export interface UserAnalytics {
  id: string
  name: string
  city: string
  joinedAt: string
  role: string
  activity: string
  engagement: number
}

export interface TopPerformingSpot {
  name: string
  location: string
  rating: number
  reviews: number
  category: string
  visitors: number
}

export interface AnalyticsInsight {
  type: 'positive' | 'warning' | 'info' | 'negative'
  title: string
  description: string
}

export interface GrowthMetrics {
  visitorsGrowth: number
  businessGrowth: number
  spotsGrowth: number
}

export interface AnalyticsSummary {
  totalVisitors: number
  totalBusinesses: number
  totalSpots: number
  approvedSpots: number
  pendingSpots: number
  rejectedSpots: number
  avgRating: number
  approvalRate: number
  totalReviews: number
  totalItineraries: number
  growth: GrowthMetrics
}

export interface ComprehensiveAnalytics {
  chartData: AnalyticsChartData[]
  businessTrends: BusinessTrend[]
  spotTrends: SpotTrend[]
  categoryTrends: CategoryTrend[]
  summary: AnalyticsSummary
  spotAnalytics: SpotAnalytics[]
  businessAnalytics: BusinessAnalytics[]
  userAnalytics: UserAnalytics[]
  topPerformingSpots: TopPerformingSpot[]
  insights: AnalyticsInsight[]
  generatedAt: string
}

// Zod schemas for runtime validation
export const spotAnalyticsSchema = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  rating: z.number(),
  reviews: z.number(),
  tags: z.array(z.string()),
  submittedAt: z.string(),
  submittedBy: z.string(),
  category: z.string(),
  performance: z.enum(['New', 'Poor', 'Fair', 'Good', 'Excellent']),
})

export const businessAnalyticsSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  joinedAt: z.string(),
  spotsCount: z.number(),
  approvedSpots: z.number(),
  pendingSpots: z.number(),
  avgRating: z.number(),
  totalReviews: z.number(),
  performance: z.enum([
    'Inactive',
    'Starting',
    'Active',
    'Growing',
    'Leading',
  ]),
})

export const userAnalyticsSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  joinedAt: z.string(),
  role: z.string(),
  activity: z.string(),
  engagement: z.number(),
})

// Table column definitions
export type SpotAnalyticsColumns = keyof SpotAnalytics
export type BusinessAnalyticsColumns = keyof BusinessAnalytics
export type UserAnalyticsColumns = keyof UserAnalytics

// Filter and sort types
export interface TableFilters {
  search?: string
  status?: string
  category?: string
  performance?: string
  dateRange?: [Date, Date]
}

export interface TableSortConfig {
  column: string
  direction: 'asc' | 'desc'
}

// Pagination type
export interface TablePagination {
  pageIndex: number
  pageSize: number
}

// Data table actions
export type DataTableAction =
  | 'view'
  | 'edit'
  | 'approve'
  | 'reject'
  | 'delete'
  | 'export'

// Export formats
export type ExportFormat = 'csv' | 'json' | 'xlsx'

// Dashboard widget types
export interface DashboardWidget {
  id: string
  title: string
  type: 'chart' | 'table' | 'metric' | 'list'
  data: any
  gridPosition?: {
    x: number
    y: number
    w: number
    h: number
  }
}
