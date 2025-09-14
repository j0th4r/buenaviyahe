'use client'

import {
  TrendingDown,
  TrendingUp,
  Building2,
  Users,
  MapPin,
  Clock,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { LguDashboardStats } from '@/types/admin'

interface LguMetricsCardsProps {
  stats: LguDashboardStats
}

export function LguMetricsCards({ stats }: LguMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-teal-950">
            Business Owners
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-teal-950 @[250px]/card:text-3xl">
            {stats.businessOwnersCount.toLocaleString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-600" />
            <Badge
              variant="outline"
            >
              <TrendingUp className="h-3 w-3 mr-1" />+
              {stats.recentBusinessRegistrations}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-teal-950">
            {stats.recentBusinessRegistrations > 0
              ? 'New registrations this month'
              : 'Stable growth'}
            <TrendingUp className="size-4 text-teal-600" />
          </div>
          <div className="text-teal-600">
            Registered business operators
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-teal-950">
            Regular Users
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-teal-950 @[250px]/card:text-3xl">
            {stats.regularUsersCount.toLocaleString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-600" />
            <Badge
              variant="outline"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              +15%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-teal-950">
            Growing user engagement
            <TrendingUp className="size-4 text-teal-600" />
          </div>
          <div className="text-teal-600">
            Platform users and visitors
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-teal-950">
            Tourism Spots
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-teal-950 @[250px]/card:text-3xl">
            {stats.totalSpots.toLocaleString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-600" />
            <Badge
              variant="outline"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-teal-950">
            Approved listings
            <TrendingUp className="size-4 text-teal-600" />
          </div>
          <div className="text-teal-600">
            Verified tourism destinations
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-teal-950">
            Pending Reviews
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-teal-950 @[250px]/card:text-3xl">
            {stats.pendingSpotsCount.toLocaleString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600" />
            <Badge
              variant="outline"
            >
              {stats.pendingSpotsCount === 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Up to date
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  Needs attention
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-teal-950">
            {stats.pendingSpotsCount === 0
              ? 'All caught up!'
              : 'Awaiting approval'}
            {stats.pendingSpotsCount === 0 ? (
              <TrendingUp className="size-4 text-teal-600" />
            ) : (
              <Clock className="size-4 text-teal-600" />
            )}
          </div>
          <div className="text-teal-600">
            {stats.pendingSpotsCount === 0
              ? 'No pending submissions'
              : 'Review required'}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
