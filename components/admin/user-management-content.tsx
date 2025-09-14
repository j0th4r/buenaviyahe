'use client'

import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Users,
  UserCheck,
  Building2,
  MoreHorizontal,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  User,
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

type UserProfile = {
  id: string
  name: string
  city: string
  role: string
  contributions: number
  created_at: string
  website?: string
}

type UserManagementContentProps = {
  users: UserProfile[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'admin':
      return (
        <Badge variant="default" className="bg-red-600 text-white">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      )
    case 'business_owner':
      return (
        <Badge variant="default" className="bg-blue-600 text-white">
          <Building2 className="h-3 w-3 mr-1" />
          Business Owner
        </Badge>
      )
    case 'user':
    default:
      return (
        <Badge variant="outline">
          <User className="h-3 w-3 mr-1" />
          User
        </Badge>
      )
  }
}

function getElevationActions(currentRole: string) {
  const actions = []

  if (currentRole === 'user') {
    actions.push({
      label: 'Elevate to Business Owner',
      newRole: 'business_owner',
      icon: <ArrowUpCircle className="h-4 w-4 mr-2" />,
      variant: 'default' as const,
    })
  }

  if (currentRole === 'business_owner') {
    actions.push({
      label: 'Demote to User',
      newRole: 'user',
      icon: <ArrowDownCircle className="h-4 w-4 mr-2" />,
      variant: 'outline' as const,
    })
  }

  return actions
}

export function UserManagementContent({
  users,
}: UserManagementContentProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Calculate user stats
  const userStats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      businessOwners: users.filter((u) => u.role === 'business_owner')
        .length,
      regularUsers: users.filter((u) => u.role === 'user').length,
    }),
    [users]
  )

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole =
        roleFilter === 'all' || user.role === roleFilter
      return matchesSearch && matchesRole
    })

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          )
        case 'oldest':
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          )
        case 'name':
          return a.name.localeCompare(b.name)
        case 'contributions':
          return (b.contributions || 0) - (a.contributions || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [users, searchTerm, roleFilter, sortBy])

  const handleRoleChange = async (
    userId: string,
    newRole: string,
    userName: string
  ) => {
    try {
      const response = await fetch('/api/admin/user-roles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user role')
      }

      toast({
        title: 'Success',
        description: `${userName}'s role has been updated to ${newRole === 'business_owner' ? 'Business Owner' : 'Regular User'}.`,
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update user role',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-teal-950">
                  User Management
                </h1>
                <p className="text-muted-foreground">
                  Manage user roles and elevate users to business
                  owners
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-teal-950">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-teal-950">
                    Business Owners
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats.businessOwners}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Can submit tourism spots
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-teal-950">
                    Regular Users
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats.regularUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Platform users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-teal-950">
                    Administrators
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats.admins}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    System administrators
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Management Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-teal-950">
                  User Accounts
                </CardTitle>
                <CardDescription>
                  View all users and manage their roles (
                  {filteredAndSortedUsers.length} of {users.length}{' '}
                  users)
                </CardDescription>

                {/* Filters */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={roleFilter}
                    onValueChange={setRoleFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="business_owner">
                        Business Owners
                      </SelectItem>
                      <SelectItem value="user">
                        Regular Users
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">
                        Newest First
                      </SelectItem>
                      <SelectItem value="oldest">
                        Oldest First
                      </SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="contributions">
                        Most Active
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-teal-950">
                        Name
                      </TableHead>
                      <TableHead className="text-teal-950">
                        Location
                      </TableHead>
                      <TableHead className="text-teal-950">
                        Role
                      </TableHead>
                      <TableHead className="text-teal-950">
                        Contributions
                      </TableHead>
                      <TableHead className="text-teal-950">
                        Join Date
                      </TableHead>
                      <TableHead className="text-teal-950">
                        Website
                      </TableHead>
                      <TableHead className="text-right text-teal-950">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {searchTerm || roleFilter !== 'all'
                                ? 'No users match your filters'
                                : 'No users found'}
                            </p>
                            {(searchTerm || roleFilter !== 'all') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchTerm('')
                                  setRoleFilter('all')
                                }}
                              >
                                Clear Filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedUsers.map((userItem) => (
                        <TableRow key={userItem.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-teal-700">
                                  {userItem.name
                                    .split(' ')
                                    .map((n: string) => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {userItem.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  ID: {userItem.id.slice(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {userItem.city || '—'}
                          </TableCell>
                          <TableCell>
                            {getRoleBadge(userItem.role)}
                          </TableCell>
                          <TableCell>
                            {userItem.contributions || 0}
                          </TableCell>
                          <TableCell>
                            {formatDate(userItem.created_at)}
                          </TableCell>
                          <TableCell>
                            {userItem.website ? (
                              <a
                                href={userItem.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View Site
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {userItem.role !== 'admin' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {getElevationActions(
                                    userItem.role
                                  ).map((action) => (
                                    <AlertDialog key={action.newRole}>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          onSelect={(e) =>
                                            e.preventDefault()
                                          }
                                        >
                                          {action.icon}
                                          {action.label}
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Confirm Role Change
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to
                                            change {userItem.name}'s
                                            role to{' '}
                                            <strong>
                                              {action.newRole ===
                                              'business_owner'
                                                ? 'Business Owner'
                                                : action.newRole ===
                                                    'user'
                                                  ? 'Regular User'
                                                  : action.newRole}
                                            </strong>
                                            ?
                                            {action.newRole ===
                                              'business_owner' && (
                                              <span className="block mt-2 text-sm">
                                                This will allow them
                                                to submit and manage
                                                tourism spots.
                                              </span>
                                            )}
                                            {action.newRole ===
                                              'user' && (
                                              <span className="block mt-2 text-sm">
                                                This will remove their
                                                ability to submit
                                                tourism spots.
                                              </span>
                                            )}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className={
                                              action.newRole ===
                                              'business_owner'
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : 'bg-orange-600 hover:bg-orange-700'
                                            }
                                            onClick={() =>
                                              handleRoleChange(
                                                userItem.id,
                                                action.newRole,
                                                userItem.name
                                              )
                                            }
                                          >
                                            Confirm Change
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  ))}

                                  <DropdownMenuItem>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Role Management Guidelines */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-teal-950">
                  Role Management Guidelines
                </CardTitle>
                <CardDescription>
                  Important considerations when managing user roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium text-teal-950">
                      Business Owner Role
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p>Can submit and manage tourism spots</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p>
                          Access to business analytics and reviews
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p>Can upload photos and update listings</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-teal-950">
                      Regular User Role
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-600 mt-0.5" />
                        <p>Can browse and review tourism spots</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-600 mt-0.5" />
                        <p>Can create travel itineraries</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-600 mt-0.5" />
                        <p>
                          Limited to viewing and using platform
                          features
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-teal-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-teal-950">
                        Administrative Reminder
                      </p>
                      <p className="text-sm text-teal-700 mt-1">
                        Always verify business legitimacy and permits
                        before elevating users to business owner
                        status. Role changes should align with LGU
                        tourism policies and business registration
                        requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

