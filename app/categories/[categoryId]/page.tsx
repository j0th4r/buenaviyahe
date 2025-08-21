"use client"

import React from "react"
import Link from 'next/link'
import { useSearchParams, notFound } from "next/navigation"
import { ArrowLeft, Star, Filter, Grid3X3 } from 'lucide-react'
import { useCategory, useSpotsByCategory } from "@/lib/api"
import { cn } from "@/lib/utils"

interface CategoryPageProps {
  params: Promise<{ categoryId: string }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = React.use(params)
  const searchParams = useSearchParams()
  const append = searchParams.get("append")
  const day = searchParams.get("day")
  
  const { data: category, loading: categoryLoading } = useCategory(resolvedParams.categoryId)
  const { data: spots, loading: spotsLoading, error } = useSpotsByCategory(resolvedParams.categoryId)

  const withForward = (href: string) => {
    const url = new URL(href, "http://dummy")
    if (append) url.searchParams.set("append", "1")
    if (day) url.searchParams.set("day", day)
    return url.pathname + (url.search ? url.search : "")
  }

  // Show loading for category info
  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!category) return notFound()

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/categories"
            className="inline-flex items-center justify-center rounded-full p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            aria-label="Go back to categories"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {category.name}
            </h1>
            <p className="text-base text-gray-600 mt-1">
              {category.description}
            </p>
          </div>
        </div>

        {/* Category Banner */}
        <section className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Discover {category.name}
                </h2>
                <p className="text-teal-100 mb-4">
                  Starting {category.priceRange}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-teal-200 mb-1">
                  {spots?.length || 0} spots available
                </p>
                <div className="flex items-center gap-1">
                  <Grid3X3 className="h-4 w-4 text-teal-300" />
                  <span className="text-sm text-teal-300">Browse all</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {spots?.length || 0} spots found
            </span>
          </div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {category.name}
          </span>
        </div>

        {/* Spots Grid */}
        <section className="mb-8">
          {spotsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[320px] animate-pulse rounded-2xl bg-gray-200" />
              ))}
            </div>
          ) : error || !spots?.length ? (
            <div className="text-center py-16">
              <div className="mb-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Grid3X3 className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No spots found
              </h3>
              <p className="text-gray-500 mb-6">
                No spots available in this category yet.
              </p>
              <Link
                href="/categories"
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Browse Other Categories
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {spots.map((spot) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  href={withForward(`/spots/${spot.slug}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Back to Categories */}
        <div className="text-center pt-8 border-t border-gray-100">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to All Categories</span>
          </Link>
        </div>
      </main>
    </div>
  )
}

interface SpotCardProps {
  spot: {
    id: string
    title: string
    location: string
    images: string[]
    rating: number
    pricing: {
      oneNight: string
    }
  }
  href: string
}

function SpotCard({ spot, href }: SpotCardProps) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:ring-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={spot.images[0] || "/placeholder.svg?height=240&width=320"}
          alt={spot.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
          {spot.title}
        </h3>
        <p className="text-gray-500 text-sm mb-3">
          {spot.location}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-gray-700">
              {spot.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm font-semibold text-teal-600">
            {spot.pricing.oneNight}
          </span>
        </div>
      </div>
    </Link>
  )
}
