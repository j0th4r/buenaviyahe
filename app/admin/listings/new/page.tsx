import { requireAdmin } from '@/lib/auth/admin'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ListingForm } from '@/components/admin/listing-form'

export default async function NewListingPage() {
  const user = await requireAdmin()

  return (
    <AdminLayout user={user}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            New Listing
          </h1>
          <p className="text-muted-foreground">
            Create a new tourist spot listing
          </p>
        </div>
      </div>

      <ListingForm />
    </AdminLayout>
  )
}
