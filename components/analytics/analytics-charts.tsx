'use client'

import * as React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
} from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'
import {
  AnalyticsChartData,
  BusinessTrend,
  SpotTrend,
  CategoryTrend,
} from '@/types/analytics'

interface AnalyticsChartsProps {
  chartData: AnalyticsChartData[]
  businessTrends: BusinessTrend[]
  spotTrends: SpotTrend[]
  categoryTrends: CategoryTrend[]
}

// Use explicit RGB color values instead of CSS variables for chart colors.
// These values are chosen to closely match the intended palette.
const chartConfig = {
  visitors: {
    label: 'Visitors',
    color: 'rgb(14, 165, 233)', // Tailwind blue-500
  },
  registrations: {
    label: 'Business Registrations',
    color: 'rgb(14, 165, 233)', // Tailwind blue-500
  },
  spots: {
    label: 'Spot Submissions',
    color: 'rgb(236, 72, 153)', // Tailwind pink-500 (accent)
  },
  submissions: {
    label: 'Submissions',
    color: 'rgb(14, 165, 233)', // Tailwind blue-500
  },
  approvals: {
    label: 'Approvals',
    color: 'rgb(16, 185, 129)', // Tailwind green-500 (success)
  },
} satisfies ChartConfig

// Colors for category pie chart
const CATEGORY_COLORS = [
  '#0ea5e9', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ec4899', // pink
  '#6366f1', // indigo
]

export function AnalyticsCharts({
  chartData,
  businessTrends,
  spotTrends,
  categoryTrends,
}: AnalyticsChartsProps) {
  const [visitorTimeRange, setVisitorTimeRange] =
    React.useState('30d')
  const [categoryView, setCategoryView] = React.useState('count')

  // Process data based on selected time range
  const filteredChartData = React.useMemo(() => {
    if (visitorTimeRange === '7d') {
      return chartData.slice(-7)
    } else if (visitorTimeRange === '14d') {
      return chartData.slice(-14)
    }
    return chartData
  }, [chartData, visitorTimeRange])

  // Calculate growth percentages
  const calculateGrowth = (data: number[]) => {
    if (data.length < 2) return 0
    const current = data[data.length - 1]
    const previous = data[data.length - 2]
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const visitorGrowth = calculateGrowth(
    filteredChartData.map((d) => d.visitors)
  )

  // Prepare category data for pie chart
  const categoryChartData = categoryTrends
    .filter((c) => c.count > 0)
    .slice(0, 10)
    .map((cat, index) => ({
      name: cat.category,
      value: categoryView === 'count' ? cat.count : cat.approved,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      ...cat,
    }))

  return (
    <div className="grid gap-6">
      {/* Tourism Activity & Top Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Tourism Activity</CardTitle>
              <CardDescription>
                Visitor registrations and activity trends
              </CardDescription>
            </div>
            <Select
              value={visitorTimeRange}
              onValueChange={setVisitorTimeRange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="h-[300px]"
            >
              <AreaChart data={filteredChartData}>
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  fill="url(#fillVisitors)"
                  stroke="rgb(14, 165, 233)"
                />
              </AreaChart>
            </ChartContainer>
            <div className="flex items-center gap-4 text-sm mt-4">
              <div className="flex items-center gap-2">
                {visitorGrowth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={
                    visitorGrowth > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {Math.abs(visitorGrowth)}% from last period
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Top Categories
              </CardTitle>
              <Select
                value={categoryView}
                onValueChange={setCategoryView}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Total</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Most popular tourism categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(
                    value: any,
                    name: string,
                    props: any
                  ) => [
                    value,
                    categoryView === 'count'
                      ? 'Total Spots'
                      : 'Approved Spots',
                  ]}
                  labelFormatter={(name) => name}
                />
              </PieChart>
            </ChartContainer>
            <div className="space-y-2 mt-4">
              {categoryChartData.slice(0, 5).map((cat, index) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1 truncate">{cat.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {cat.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business and Spot Trends */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business Growth</CardTitle>
            <CardDescription>
              New business registrations and spot submissions over
              time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="h-[300px]"
            >
              <BarChart data={businessTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="registrations"
                  fill="rgb(14, 165, 233)"
                />
                <Bar dataKey="spots" fill="rgb(236, 72, 153)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spot Management</CardTitle>
            <CardDescription>
              Daily submissions vs approvals for spot management
              efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="h-[300px]"
            >
              <AreaChart data={spotTrends}>
                <defs>
                  <linearGradient
                    id="fillSubmissions"
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
                  <linearGradient
                    id="fillApprovals"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="rgb(16, 185, 129)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgb(16, 185, 129)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stackId="1"
                  fill="url(#fillSubmissions)"
                  stroke="rgb(14, 165, 233)"
                />
                <Area
                  type="monotone"
                  dataKey="approvals"
                  stackId="2"
                  fill="url(#fillApprovals)"
                  stroke="rgb(16, 185, 129)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance Details</CardTitle>
          <CardDescription>
            Detailed breakdown of performance metrics by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-7 gap-4 p-4 font-medium text-sm bg-muted/50">
              <div>Category</div>
              <div className="text-center">Total</div>
              <div className="text-center">Approved</div>
              <div className="text-center">Pending</div>
              <div className="text-center">Rejected</div>
              <div className="text-center">Avg Rating</div>
              <div className="text-center">Reviews</div>
            </div>
            <div className="divide-y">
              {categoryTrends.slice(0, 10).map((category) => (
                <div
                  key={category.category}
                  className="grid grid-cols-7 gap-4 p-4 text-sm"
                >
                  <div className="font-medium">
                    {category.category}
                  </div>
                  <div className="text-center">{category.count}</div>
                  <div className="text-center text-green-600">
                    {category.approved}
                  </div>
                  <div className="text-center text-yellow-600">
                    {category.pending}
                  </div>
                  <div className="text-center text-red-600">
                    {category.rejected}
                  </div>
                  <div className="text-center">
                    {category.avgRating > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <span>{category.avgRating}</span>
                        <span className="text-yellow-400">★</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  <div className="text-center">
                    {category.totalReviews}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
