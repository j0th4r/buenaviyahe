import { requireBusinessOwner } from '@/lib/auth/admin'
import { BusinessLayout } from '@/components/admin/business-layout'
import { BusinessSpotForm } from '@/components/admin/business-spot-form'

export default async function NewBusinessSpot() {
  const user = await requireBusinessOwner()

  return (
    <BusinessLayout user={user}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-teal-950">
            Add New Spot
          </h1>
          <p className="text-muted-foreground">
            Register a new tourist destination for your business
          </p>
        </div>

        <BusinessSpotForm ownerId={user.id} />
      </div>
    </BusinessLayout>
  )
}

