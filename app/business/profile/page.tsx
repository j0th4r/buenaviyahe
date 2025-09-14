import { requireBusinessOwner } from '@/lib/auth/admin'
import { BusinessLayout } from '@/components/admin/business-layout'
import { BusinessProfileForm } from '@/components/admin/business-profile-form'

export default async function BusinessProfile() {
  const user = await requireBusinessOwner()

  return (
    <BusinessLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-teal-950">
            Business Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your business information and settings
          </p>
        </div>

        <div className="max-w-2xl">
          <BusinessProfileForm user={user} />
        </div>
      </div>
    </BusinessLayout>
  )
}
