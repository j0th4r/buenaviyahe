'use client'

import { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { Star, MapPin, Calendar, Users } from 'lucide-react'

import {
  SpotAnalytics,
  BusinessAnalytics,
  UserAnalytics,
} from '@/types/analytics'
import { SortableHeader, StatusBadge } from './analytics-data-table'
import { Badge } from '@/components/ui/badge'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Spot Analytics Columns
export const spotAnalyticsColumns: ColumnDef<SpotAnalytics>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <SortableHeader column={column} title="Spot Name" />
    ),
    cell: ({ row }) => {
      const spot = row.original
      return (
        <div className="flex flex-col">
          <div className="font-medium text-sm">{spot.title}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            {spot.location}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <SortableHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.getValue('category') as string
      return <Badge variant="outline">{category}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <SortableHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <StatusBadge status={row.getValue('status')} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => (
      <SortableHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number
      const reviews = row.original.reviews
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 font-medium">
              {rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({reviews})
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'submittedBy',
    header: ({ column }) => (
      <SortableHeader column={column} title="Submitted By" />
    ),
    cell: ({ row }) => {
      const submittedBy = row.getValue('submittedBy') as string
      const submittedAt = row.original.submittedAt
      return (
        <div className="flex flex-col">
          <span className="text-sm">{submittedBy}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(submittedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      )
    },
  },
]

// Business Analytics Columns
export const businessAnalyticsColumns: ColumnDef<BusinessAnalytics>[] =
  [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <SortableHeader column={column} title="Business" />
      ),
      cell: ({ row }) => {
        const business = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={business.name} />
              <AvatarFallback className="text-xs">
                {getInitials(business.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="font-medium text-sm">
                {business.name}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {business.city}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'spotsCount',
      header: ({ column }) => (
        <SortableHeader column={column} title="Spots" />
      ),
      cell: ({ row }) => {
        const total = row.getValue('spotsCount') as number
        const approved = row.original.approvedSpots
        const pending = row.original.pendingSpots
        return (
          <div className="flex flex-col items-center">
            <div className="font-medium">{total}</div>
            <div className="flex gap-1 text-xs">
              <span className="text-green-600">
                {approved} approved
              </span>
              {pending > 0 && (
                <span className="text-yellow-600">
                  {pending} pending
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'avgRating',
      header: ({ column }) => (
        <SortableHeader column={column} title="Avg Rating" />
      ),
      cell: ({ row }) => {
        const rating = row.getValue('avgRating') as number
        const reviews = row.original.totalReviews
        if (rating === 0)
          return (
            <span className="text-muted-foreground">No ratings</span>
          )
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 font-medium">
                {rating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({reviews})
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'joinedAt',
      header: ({ column }) => (
        <SortableHeader column={column} title="Joined" />
      ),
      cell: ({ row }) => {
        const joinedAt = row.getValue('joinedAt') as string
        return (
          <div className="flex items-center text-sm">
            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
            {formatDate(joinedAt)}
          </div>
        )
      },
    },
  ]

// User Analytics Columns
export const userAnalyticsColumns: ColumnDef<UserAnalytics>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <SortableHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback className="text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium text-sm">{user.name}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {user.city}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <SortableHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      return (
        <Badge variant="outline" className="capitalize">
          {role}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'activity',
    header: ({ column }) => (
      <SortableHeader column={column} title="Activity" />
    ),
    cell: ({ row }) => {
      const activity = row.getValue('activity') as string
      return <StatusBadge status={activity} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'engagement',
    header: ({ column }) => (
      <SortableHeader column={column} title="Engagement" />
    ),
    cell: ({ row }) => {
      const engagement = row.getValue('engagement') as number
      const level =
        engagement >= 75
          ? 'High'
          : engagement >= 50
            ? 'Medium'
            : 'Low'
      const color =
        engagement >= 75
          ? 'text-green-600'
          : engagement >= 50
            ? 'text-yellow-600'
            : 'text-red-600'

      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className={`font-medium ${color}`}>
              {engagement}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {level}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'joinedAt',
    header: ({ column }) => (
      <SortableHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      const joinedAt = row.getValue('joinedAt') as string
      return (
        <div className="flex flex-col">
          <span className="text-sm">{formatDate(joinedAt)}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(joinedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      )
    },
  },
]

// Filter options for dropdowns
export const spotFilterOptions = {
  status: [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ],
  category: [
    { label: 'Beaches', value: 'beaches' },
    { label: 'Parks', value: 'parks' },
    { label: 'Popular', value: 'popular' },
    { label: 'Featured', value: 'featured' },
    { label: 'Swimming', value: 'swimming' },
    { label: 'Family', value: 'family' },
    { label: 'Budget', value: 'budget' },
  ],
}

export const businessFilterOptions = {}

export const userFilterOptions = {
  role: [
    { label: 'User', value: 'user' },
    { label: 'Business Owner', value: 'business_owner' },
    { label: 'Admin', value: 'admin' },
  ],
  activity: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ],
}
