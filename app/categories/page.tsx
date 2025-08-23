'use client'

import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { useCategories } from '@/lib/api'
import { getImageUrl } from '@/lib/utils/image'
import type { Category as DbCategory } from '@/lib/api/categories'

export default function CategoriesPage() {
  const { data: categories, loading, error } = useCategories()

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            aria-label="Go back to home"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Categories
            </h1>
            <p className="text-base text-gray-600 mt-1">
              Explore spots by category
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <section className="mb-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[240px] animate-pulse rounded-2xl bg-gray-200"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">
                Unable to load categories
              </p>
              <p className="text-gray-400">Please try again later</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories?.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="bg-gray-50 rounded-2xl p-6 mt-8">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-teal-100 p-2">
              <MapPin className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Discover Buenavista
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Each category offers unique experiences in Buenavista,
                Agusan Del Norte. From pristine beaches to adventure
                parks, find your perfect getaway.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

interface CategoryCardProps {
  category: DbCategory
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:ring-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={
            getImageUrl(category.image) ||
            '/placeholder.svg?height=240&width=320'
          }
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
          {category.name}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
          {category.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-teal-600">
            {category.price_range}
          </span>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Explore →
          </span>
        </div>
      </div>
    </Link>
  )
}
