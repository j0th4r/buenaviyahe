export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
        {/* Header Skeleton */}
        <div className="mb-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Banner Skeleton */}
        <section className="mb-8 h-32 rounded-2xl bg-gray-200 animate-pulse" />

        {/* Filter Bar Skeleton */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Spots Grid Skeleton */}
        <section className="mb-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[320px] animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}






