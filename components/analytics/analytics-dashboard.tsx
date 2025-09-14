'use client'

import * as React from 'react'
import {
  TrendingUp,
  Users,
  Building2,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'

import { ComprehensiveAnalytics } from '@/types/analytics'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

import { AnalyticsCharts } from './analytics-charts'
import { AnalyticsDataTable } from './analytics-data-table'
import {
  spotAnalyticsColumns,
  businessAnalyticsColumns,
  userAnalyticsColumns,
  spotFilterOptions,
  businessFilterOptions,
  userFilterOptions,
} from './analytics-columns'

interface AnalyticsDashboardProps {
  period?: string
}

export function AnalyticsDashboard({
  period = '30',
}: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState(period)
  const [analytics, setAnalytics] =
    React.useState<ComprehensiveAnalytics | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAnalytics = React.useCallback(
    async (periodValue: string) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(
          `/api/admin/analytics/comprehensive?period=${periodValue}`,
          {
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const data: ComprehensiveAnalytics = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unknown error occurred'
        )
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  React.useEffect(() => {
    fetchAnalytics(selectedPeriod)
  }, [selectedPeriod, fetchAnalytics])

  // Auto-refresh every 5 minutes
  React.useEffect(() => {
    const interval = setInterval(
      () => {
        fetchAnalytics(selectedPeriod)
      },
      5 * 60 * 1000
    )

    return () => clearInterval(interval)
  }, [selectedPeriod, fetchAnalytics])

  const handleRefresh = () => {
    fetchAnalytics(selectedPeriod)
  }

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod)
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading analytics</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading || !analytics) {
    return <AnalyticsLoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-teal-950">
            Reports and Analytics
          </h2>
          <p className="text-muted-foreground">
            Comprehensive insights and data-driven tourism management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedPeriod}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            Updated{' '}
            {new Date(analytics.generatedAt).toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Visitors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.summary.totalVisitors.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.summary.growth.visitorsGrowth > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              ) : (
                <TrendingUp className="mr-1 h-3 w-3 text-red-600 rotate-180" />
              )}
              <span
                className={
                  analytics.summary.growth.visitorsGrowth > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {Math.abs(analytics.summary.growth.visitorsGrowth)}%
                from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Businesses
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.summary.totalBusinesses}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Growth: </span>
              {analytics.summary.growth.businessGrowth > 0 ? (
                <TrendingUp className="ml-1 mr-1 h-3 w-3 text-green-600" />
              ) : (
                <TrendingUp className="ml-1 mr-1 h-3 w-3 text-red-600 rotate-180" />
              )}
              <span
                className={
                  analytics.summary.growth.businessGrowth > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {Math.abs(analytics.summary.growth.businessGrowth)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tourism Spots
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.summary.totalSpots}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="mr-1 h-2 w-2" />
                {analytics.summary.approvedSpots}
              </Badge>
              <Badge variant="secondary">
                {analytics.summary.pendingSpots} pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {analytics.summary.avgRating.toFixed(1)}
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
            </div>
            <p className="text-xs text-muted-foreground">
              From {analytics.summary.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {analytics.insights.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analytics.insights.map((insight, index) => (
            <Alert
              key={index}
              variant={
                insight.type === 'warning' ? 'destructive' : 'default'
              }
            >
              {insight.type === 'positive' && (
                <CheckCircle className="h-4 w-4" />
              )}
              {insight.type === 'warning' && (
                <AlertCircle className="h-4 w-4" />
              )}
              {insight.type === 'info' && (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{insight.title}</AlertTitle>
              <AlertDescription>
                {insight.description}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Charts Section */}
      <AnalyticsCharts
        chartData={analytics.chartData}
        businessTrends={analytics.businessTrends}
        spotTrends={analytics.spotTrends}
        categoryTrends={analytics.categoryTrends}
      />

      {/* Data Tables Section */}
      <Tabs defaultValue="spots" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="spots">Tourism Spots</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="spots" className="space-y-4">
          <AnalyticsDataTable
            columns={spotAnalyticsColumns}
            data={analytics.spotAnalytics}
            searchKey="title"
            filterableColumns={[
              {
                key: 'status',
                title: 'Status',
                options: spotFilterOptions.status,
              },
            ]}
            title="Tourism Spots Analytics"
            description="Detailed performance metrics for all tourism spots in the system"
            exportable
          />
        </TabsContent>

        <TabsContent value="businesses" className="space-y-4">
          <AnalyticsDataTable
            columns={businessAnalyticsColumns}
            data={analytics.businessAnalytics}
            searchKey="name"
            filterableColumns={[]}
            title="Business Analytics"
            description="Performance metrics and insights for registered businesses"
            exportable
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <AnalyticsDataTable
            columns={userAnalyticsColumns}
            data={analytics.userAnalytics}
            searchKey="name"
            filterableColumns={[
              {
                key: 'role',
                title: 'Role',
                options: userFilterOptions.role,
              }
            ]}
            title="User Analytics"
            description="User engagement and activity metrics"
            exportable
          />
        </TabsContent>
      </Tabs>

      {/* Top Performing Spots */}
      {analytics.topPerformingSpots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Tourism Spots</CardTitle>
            <CardDescription>
              Highest-rated and most popular destinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analytics.topPerformingSpots
                .slice(0, 6)
                .map((spot, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">
                        {spot.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {spot.location}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="ml-1">
                            {spot.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          ({spot.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Loading skeleton component
function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
