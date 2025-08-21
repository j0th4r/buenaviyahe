import { ArrowLeft } from "lucide-react"

export default function Loading() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="rounded-full p-1">
          <ArrowLeft className="h-6 w-6 text-gray-300" />
        </div>
        <h1 className="text-xl font-bold text-gray-300">Plan Details</h1>
        <div className="w-6" />
      </header>

      {/* Plan Header Skeleton */}
      <div className="mb-8 text-center">
        <div className="h-8 w-64 mx-auto bg-gray-200 rounded-lg animate-pulse mb-2"></div>
        <div className="flex items-center justify-center gap-4">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Day Tabs Skeleton */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
        ))}
      </div>

      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>

      {/* Spots Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}
