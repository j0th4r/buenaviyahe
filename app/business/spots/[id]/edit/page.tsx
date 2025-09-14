import { requireBusinessOwner } from '@/lib/auth/admin'
import { BusinessLayout } from '@/components/admin/business-layout'
import { BusinessSpotForm } from '@/components/admin/business-spot-form'
import { createServiceClient } from '@/lib/supabase/config'
import { notFound, redirect } from 'next/navigation'

interface EditSpotPageProps {
  params: {
    id: string
  }
}

async function getSpot(spotId: string, ownerId: string) {
  const supabase = createServiceClient()

  const { data: spot, error } = await supabase
    .from('spots')
    .select('*')
    .eq('id', spotId)
    .eq('owner_id', ownerId) // Ensure user can only edit their own spots
    .single()

  if (error || !spot) {
    return null
  }

  return spot
}

export default async function EditBusinessSpot({
  params,
}: EditSpotPageProps) {
  const user = await requireBusinessOwner()
  const spot = await getSpot(params.id, user.id)

  if (!spot) {
    notFound()
  }

  return (
    <BusinessLayout user={user}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-teal-950">
            Edit Spot
          </h1>
          <p className="text-muted-foreground">
            Update your spot information
          </p>
        </div>

        <BusinessSpotForm ownerId={user.id} initialData={spot} />
      </div>
    </BusinessLayout>
  )
}



























