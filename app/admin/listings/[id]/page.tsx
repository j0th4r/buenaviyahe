import { requireAdmin } from '@/lib/auth/admin'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ListingForm } from '@/components/admin/listing-form'
import { createServiceClient } from '@/lib/supabase/config'
import { notFound } from 'next/navigation'

interface EditListingPageProps {
  params: {
    id: string
  }
}

async function getListing(id: string) {
  const supabase = createServiceClient()

  try {
    const { data: spot, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return spot
  } catch (error) {
    console.error('Error fetching listing:', error)
    return null
  }
}

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const user = await requireAdmin()
  const { id } = await params
  const listing = await getListing(id)

  if (!listing) {
    notFound()
  }

  return (
    <AdminLayout user={user}>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Listing</h1>
          <p className="text-muted-foreground">
            Update the details for {listing.title}
          </p>
        </div>

        <ListingForm initialData={listing} isEditing={true} />
      </div>
    </AdminLayout>
  )
}
