import { Database } from '@/types/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
} from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']
type Spot = Database['public']['Tables']['spots']['Row']

interface BusinessOwnerWithSpots extends Profile {
  spots: Spot[]
}

interface BusinessOwnersTableProps {
  businessOwners: BusinessOwnerWithSpots[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getStatusBadge(hasSpots: boolean) {
  return hasSpots ? (
    <Badge variant="default" className="bg-green-700 text-white">
      <CheckCircle className="h-3 w-3 mr-1" />
      Active
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="border-orange-200 text-orange-700"
    >
      <XCircle className="h-3 w-3 mr-1" />
      No Spots
    </Badge>
  )
}

export function BusinessOwnersTable({
  businessOwners,
}: BusinessOwnersTableProps) {
  if (businessOwners.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center gap-2">
          <Building2 className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No business owners registered yet
          </p>
          <p className="text-sm text-muted-foreground">
            Start by registering your first business owner above
          </p>
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-teal-950">Owner Name</TableHead>
          <TableHead className="text-teal-950">Location</TableHead>
          <TableHead className="text-teal-950">Spots</TableHead>
          <TableHead className="text-teal-950">Contact</TableHead>
          <TableHead className="text-teal-950">Status</TableHead>
          <TableHead className="text-teal-950">Registered</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {businessOwners.map((owner) => (
          <TableRow key={owner.id}>
            <TableCell className="font-medium">
              {owner.name}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">
                  {owner.city || 'Not specified'}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <Badge variant="secondary">
                  {owner.spots.length} spot
                  {owner.spots.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {owner.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">{owner.website}</span>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              {getStatusBadge(owner.spots.length > 0)}
            </TableCell>
            <TableCell>{formatDate(owner.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
