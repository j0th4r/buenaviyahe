import { requireAdmin } from '@/lib/auth/admin'
import { AdminLayout } from '@/components/admin/admin-layout'
import { PhotoUpload } from '@/components/admin/photo-upload'

export default async function UploadPage() {
  const user = await requireAdmin()

  return (
    <AdminLayout user={user}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Photo Upload
          </h1>
          <p className="text-muted-foreground">
            Upload and manage photos for your tourist spot listings
          </p>
        </div>
      </div>

      <PhotoUpload />
    </AdminLayout>
  )
}
