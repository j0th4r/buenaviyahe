'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  usePopularSpots,
  useCategories,
  searchSpots,
} from '@/lib/api'
import { getImageUrl } from '@/lib/utils/image'
import { Suspense, useState, useEffect } from 'react'
import { BottomTabs } from '@/components/ui/bottom-tabs'

// Custom hook to safely check if we're on the client
function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

function PageContent() {
  const params = useSearchParams()
  const isClient = useIsClient()

  // Safely get search params - only use them after hydration
  const append = isClient ? params.get('append') : null
  const day = isClient ? params.get('day') : null
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [searchResults, setSearchResults] = useState<any[] | null>(
    null
  )
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Fetch data using API hooks
  const {
    data: popularSpots,
    loading: spotsLoading,
    error: spotsError,
  } = usePopularSpots(3)
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories()

  const withForward = (href: string) => {
    // Always return the same structure on server and client
    // We'll handle the URL building consistently
    const url = new URL(href, 'http://dummy')
    if (append) url.searchParams.set('append', '1')
    if (day) url.searchParams.set('day', day)
    return url.pathname + (url.search ? url.search : '')
  }

  // Debounce the query to avoid spamming the API
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(id)
  }, [query])

  // Fetch search results when debounced query changes
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!debounced) {
        setSearchResults(null)
        setSearchLoading(false)
        setSearchError(null)
        return
      }
      setSearchLoading(true)
      setSearchError(null)
      try {
        const all = await searchSpots({ query: debounced, limit: 8 })
        if (!cancelled) setSearchResults(all || [])
      } catch (err) {
        if (!cancelled) {
          setSearchResults([])
          setSearchError('Search failed. Please try again.')
        }
      } finally {
        if (!cancelled) setSearchLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [debounced])

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
        <section aria-labelledby="intro-heading" className="mb-6">
          <p className="text-base text-muted-foreground">
            Find your next trip
          </p>
          <h1
            id="intro-heading"
            className="mt-1 text-4xl font-extrabold tracking-tight"
          >
            Explore Buenavista
          </h1>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
              />
              <input
                aria-label="Search"
                placeholder="Search spots by name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-14 w-full rounded-full border border-gray-200 bg-white pl-12 pr-4 text-base shadow-sm outline-none placeholder:text-gray-400 focus:border-teal-500"
              />
            </div>
          </div>
        </section>

        {query.trim() && (
          <section
            aria-labelledby="search-results-heading"
            className="mb-8"
          >
            <h2
              id="search-results-heading"
              className="text-2xl font-bold tracking-tight"
            >
              Search results
            </h2>
            <div className="mt-4">
              {searchLoading ? (
                <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-[180px] w-full animate-pulse rounded-3xl bg-gray-200"
                    />
                  ))}
                </div>
              ) : searchError ? (
                <div className="text-center py-8 text-gray-500">
                  <p>{searchError}</p>
                </div>
              ) : (searchResults?.length ?? 0) === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No spots match "{debounced}"</p>
                </div>
              ) : (
                <ul className="grid gap-4 lg:grid-cols-3 lg:gap-6">
                  {searchResults?.map((spot: any) => (
                    <li key={spot.id}>
                      <LocationCard
                        title={spot.title}
                        price={spot?.pricing?.oneNight ?? ''}
                        rating={Number(spot?.rating ?? 0).toString()}
                        img={getImageUrl(
                          spot?.images?.[0] ||
                            '/placeholder.svg?height=180&width=320'
                        )}
                        href={withForward(`/spots/${spot.slug}`)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {!query.trim() && (
          <section aria-labelledby="popular-heading" className="mb-8">
            <h2
              id="popular-heading"
              className="text-2xl font-bold tracking-tight"
            >
              Popular locations
            </h2>
            <div className="mt-4 overflow-x-auto pb-1 lg:mx-0 lg:overflow-visible">
              {spotsLoading ? (
                <div className="flex gap-4 px-5 lg:grid lg:grid-cols-3 lg:gap-6 lg:px-0">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-[180px] w-[320px] shrink-0 animate-pulse rounded-3xl bg-gray-200 lg:h-[260px] lg:w-full"
                    />
                  ))}
                </div>
              ) : spotsError ? (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    Unable to load popular spots. Please try again
                    later.
                  </p>
                </div>
              ) : (
                <ul className="flex snap-x snap-mandatory gap-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:px-0 lg:snap-none">
                  {popularSpots?.map((spot: any) => (
                    <li
                      key={spot.id}
                      className="snap-start lg:snap-none"
                    >
                      <LocationCard
                        title={spot.title}
                        price={spot.pricing.oneNight}
                        rating={spot.rating.toString()}
                        img={getImageUrl(
                          spot.images[0] ||
                            '/placeholder.svg?height=180&width=320'
                        )}
                        href={withForward(`/spots/${spot.slug}`)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {!query.trim() && (
          <section
            aria-labelledby="category-heading"
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                id="category-heading"
                className="text-2xl font-bold tracking-tight"
              >
                Category
              </h2>
              <Link
                href="/categories"
                className="text-teal-600 hover:text-teal-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-teal-50 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto lg:mx-0 lg:overflow-visible">
              {categoriesLoading ? (
                <div className="flex gap-4 px-5 lg:grid lg:grid-cols-3 lg:gap-6 lg:px-0">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-[260px] w-[200px] shrink-0 animate-pulse rounded-3xl bg-gray-200 lg:h-[320px] lg:w-full"
                    />
                  ))}
                </div>
              ) : categoriesError ? (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    Unable to load categories. Please try again later.
                  </p>
                </div>
              ) : (
                <ul className="flex snap-x snap-mandatory gap-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:px-0 lg:snap-none">
                  {categories?.slice(0, 3).map((category: any) => (
                    <li
                      key={category.id}
                      className="snap-start lg:snap-none"
                    >
                      <CategoryCard
                        title={category.name}
                        price={category.price_range}
                        img={getImageUrl(
                          category.image ||
                            '/placeholder.svg?height=260&width=200'
                        )}
                        href={withForward(
                          `/categories/${category.id}`
                        )}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>

      <BottomTabs />
    </div>
  )
}

// Loading component for Suspense fallback
function PageLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
        <section aria-labelledby="intro-heading" className="mb-6">
          <p className="text-base text-muted-foreground">
            Find your next trip
          </p>
          <h1
            id="intro-heading"
            className="mt-1 text-4xl font-extrabold tracking-tight"
          >
            Explore Buenavista
          </h1>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
              />
              <input
                aria-label="Search"
                placeholder="Search..."
                className="h-14 w-full rounded-full border border-gray-200 bg-white pl-12 pr-4 text-base shadow-sm outline-none placeholder:text-gray-400 focus:border-teal-500"
              />
            </div>
            <button
              aria-label="Open filters"
              className="grid h-14 w-14 place-items-center rounded-full bg-teal-500 text-white shadow-lg"
            >
              <SlidersHorizontal className="h-6 w-6" />
            </button>
          </div>
        </section>

        <section aria-labelledby="popular-heading" className="mb-8">
          <h2
            id="popular-heading"
            className="text-2xl font-bold tracking-tight"
          >
            Popular locations
          </h2>
          <div className="mt-4 overflow-x-auto pb-1 lg:mx-0 lg:overflow-visible">
            <div className="flex gap-4 px-5 lg:grid lg:grid-cols-3 lg:gap-6 lg:px-0">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[180px] w-[320px] shrink-0 animate-pulse rounded-3xl bg-gray-200 lg:h-[260px] lg:w-full"
                />
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="category-heading" className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="category-heading"
              className="text-2xl font-bold tracking-tight"
            >
              Category
            </h2>
            <div className="text-teal-600 hover:text-teal-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-teal-50 transition-colors">
              View All
            </div>
          </div>
          <div className="mt-4 overflow-x-auto lg:mx-0 lg:overflow-visible">
            <div className="flex gap-4 px-5 lg:grid lg:grid-cols-3 lg:gap-6 lg:px-0">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[260px] w-[200px] shrink-0 animate-pulse rounded-3xl bg-gray-200 lg:h-[320px] lg:w-full"
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <BottomTabs />
    </div>
  )
}

// Main page component wrapped in Suspense to prevent hydration issues
export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PageContent />
    </Suspense>
  )
}

type LocationCardProps = {
  title: string
  price: string
  rating: string
  img: string
  href?: string
}
function LocationCard({
  title,
  price,
  rating,
  img,
  href,
}: LocationCardProps) {
  const Card = (
    <article className="relative h-[180px] w-[320px] shrink-0 overflow-hidden rounded-3xl lg:h-[260px] lg:w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
      <img
        src={img || '/placeholder.svg'}
        alt={title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 grid gap-2 p-4 text-white">
        <h3 className="text-2xl font-extrabold drop-shadow-sm">
          {title}
        </h3>
        <div className="flex items-center justify-between text-sm font-medium opacity-95">
          <span>{price}</span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
            {rating}
          </span>
        </div>
      </div>
    </article>
  )
  return href ? (
    <Link
      href={href}
      aria-label={`Open details for ${title}`}
      className="block"
    >
      {Card}
    </Link>
  ) : (
    Card
  )
}

type CategoryCardProps = {
  title: string
  price: string
  img: string
  className?: string
  href?: string
}
function CategoryCard({
  title,
  price,
  img,
  className,
  href,
}: CategoryCardProps) {
  const Card = (
    <article
      className={cn(
        'relative h-[260px] w-[200px] shrink-0 overflow-hidden rounded-3xl lg:h-[320px] lg:w-full',
        className
      )}
    >
      <img
        src={img || '/placeholder.svg'}
        alt={title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 grid gap-2 p-4 text-white">
        <h3 className="text-xl font-extrabold drop-shadow-sm">
          {title}
        </h3>
        <p className="text-sm opacity-95">{price}</p>
      </div>
    </article>
  )
  return href ? (
    <Link
      href={href}
      aria-label={`Open details for ${title}`}
      className="block"
    >
      {Card}
    </Link>
  ) : (
    Card
  )
}

// BottomTabs moved to components/ui/bottom-tabs
