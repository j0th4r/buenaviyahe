'use client'

import * as React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartDataPoint {
  date: string
  visitors: number
}

const chartConfig = {
  visitors: {
    label: 'Users',
    color: 'rgb(14, 165, 233)', // Tailwind blue-500
  },
} satisfies ChartConfig

export function TourismActivityChart() {
  const [timeRange, setTimeRange] = React.useState('30')
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>(
    []
  )
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const fetchData = React.useCallback(async (period: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `/api/admin/analytics/comprehensive?period=${period}`,
        {
          cache: 'no-store',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const data = await response.json()
      // Ensure all visitor counts are non-negative integers
      const sanitizedData = (data.chartData || []).map(
        (item: ChartDataPoint) => ({
          ...item,
          visitors: Math.max(0, Math.floor(item.visitors || 0)),
        })
      )
      setChartData(sanitizedData)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unknown error occurred'
      )
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData(timeRange)
  }, [timeRange, fetchData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData(timeRange)
  }

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange)
  }

  // Calculate growth percentage
  const calculateGrowth = () => {
    if (chartData.length < 2) return 0
    const current = chartData[chartData.length - 1]?.visitors || 0
    const previous = chartData[chartData.length - 2]?.visitors || 0
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const visitorGrowth = calculateGrowth()

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-950">
            Tourism Activity
          </CardTitle>
          <CardDescription className="text-red-700">
            Error loading data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
          <div className="flex items-center gap-4 text-sm mt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-teal-950">
            Tourism Activity
          </CardTitle>
          <CardDescription>
            User registrations and activity trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <p>
                No visitor data available for the selected period.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="grid gap-2">
          <CardTitle className="text-teal-950">
            Tourism Activity
          </CardTitle>
          <CardDescription>
            User registrations and activity trends
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={handleTimeRangeChange}
          >
            <SelectTrigger
              className="w-32"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90" className="rounded-lg">
                Last 3 months
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <defs>
              <linearGradient
                id="fillVisitors"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="rgb(14, 165, 233)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="rgb(14, 165, 233)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
              className="text-teal-700"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-teal-700"
              domain={[0, (dataMax: number) => Math.max(dataMax, 1)]}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString(
                      'en-US',
                      {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="visitors"
              type="monotone"
              fill="url(#fillVisitors)"
              fillOpacity={0.4}
              stroke="rgb(14, 165, 233)"
              strokeWidth={2}
              connectNulls={false}
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex flex-col gap-2 pt-4 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none text-teal-950">
            {visitorGrowth > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={
                visitorGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }
            >
              {Math.abs(visitorGrowth)}% from last period
            </span>
          </div>
          <div className="text-muted-foreground text-teal-950">
            Showing daily user registration trends based on real
            data
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
