'use client'

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
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
import { BarChart3 } from 'lucide-react'

interface SpotAnalytics {
  id: string
  title: string
  totalBookings: number
  totalViews: number
  revenue: number
  rating: number
  reviewCount: number
}

interface MonthlyRevenue {
  month: string
  [key: string]: string | number // Dynamic spot keys for revenue
}

interface RevenueChartProps {
  spotAnalytics: SpotAnalytics[]
  monthlyRevenue: MonthlyRevenue[]
}

function generateChartConfig(
  spotAnalytics: SpotAnalytics[]
): ChartConfig {
  const colors = [
    '#0891b2',
    '#059669',
    '#dc2626',
    '#7c3aed',
    '#ea580c',
    '#0284c7',
    '#65a30d',
    '#db2777',
  ]

  const config: ChartConfig = {}

  spotAnalytics.forEach((spot, index) => {
    const spotKey = spot.title.replace(/\s+/g, '').toLowerCase()
    config[spotKey] = {
      label: spot.title,
      color: colors[index % colors.length],
    }
  })

  return config
}

export function RevenueChart({
  spotAnalytics,
  monthlyRevenue,
}: RevenueChartProps) {
  const chartConfig = generateChartConfig(spotAnalytics)

  if (spotAnalytics.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="text-teal-950">
            Monthly Revenue by Spot
          </CardTitle>
          <CardDescription>
            Revenue trends for each location over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No revenue data available yet. Add spots and get
                bookings to see revenue trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-teal-950">
          Monthly Revenue by Spot
        </CardTitle>
        <CardDescription>
          Revenue trends for each location over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Custom Legend */}
        <div className="mb-6 p-3 bg-muted/30 rounded-lg">
          <p className="text-sm font-medium text-teal-950 mb-3">
            Spots Legend
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {spotAnalytics.map((spot, index) => {
              const spotKey = spot.title
                .replace(/\s+/g, '')
                .toLowerCase()
              const color =
                chartConfig[spotKey]?.color || 'hsl(var(--chart-1))'
              return (
                <div
                  key={spotKey}
                  className="flex items-center gap-3 p-2 rounded bg-background"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {spot.title}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={monthlyRevenue}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              {spotAnalytics.map((spot) => {
                const spotKey = spot.title
                  .replace(/\s+/g, '')
                  .toLowerCase()
                const color =
                  chartConfig[spotKey]?.color || 'hsl(var(--chart-1))'
                return (
                  <linearGradient
                    key={spotKey}
                    id={`fill${spotKey}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                )
              })}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name) => [
                    `₱${Number(value).toLocaleString()} `,
                    chartConfig[name as keyof typeof chartConfig]
                      ?.label || name,
                  ]}
                />
              }
            />
            {spotAnalytics.map((spot) => {
              const spotKey = spot.title
                .replace(/\s+/g, '')
                .toLowerCase()
              return (
                <Area
                  key={spotKey}
                  dataKey={spotKey}
                  type="natural"
                  fill={
                    chartConfig[spotKey]?.color ||
                    'hsl(var(--chart-1))'
                  }
                  fillOpacity={0.2}
                  stroke={
                    chartConfig[spotKey]?.color ||
                    'hsl(var(--chart-1))'
                  }
                  strokeWidth={2}
                  stackId="a"
                />
              )
            })}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
