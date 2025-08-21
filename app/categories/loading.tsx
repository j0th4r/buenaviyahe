export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
        {/* Header Skeleton */}
        <div className="mb-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Categories Grid Skeleton */}
        <section className="mb-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2].map(i => (
              <div key={i} className="h-[240px] animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        </section>

        {/* Info Section Skeleton */}
        <section className="bg-gray-50 rounded-2xl p-6 mt-8">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-gray-200 p-2 w-9 h-9 animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
