'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  StarHalf,
  MapPin,
  Clock,
  PhilippinePeso,
  Users,
  Phone,
  Globe,
  Heart,
  Share2,
  Wifi,
  Car,
  Utensils,
  Coffee,
  Car as Parking,
  Droplets,
  Dumbbell,
  Sparkles,
} from 'lucide-react'
import { useSpot } from '@/lib/api'
import { getImageUrl } from '@/lib/utils/image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function SpotSeeMorePage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: spot, loading, error } = useSpot(slug)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    )
  }

  if (error || !spot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Spot not found
          </h1>
          <Link
            href="/"
            className="text-teal-600 hover:text-teal-700"
          >
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  const fullStars = Math.floor(spot.rating)
  const hasHalf = spot.rating % 1 >= 0.5
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0))

  const amenities = [
    { icon: Wifi, name: 'Free WiFi', available: true },
    { icon: Parking, name: 'Free Parking', available: true },
    { icon: Droplets, name: 'Swimming Pool', available: true },
    { icon: Dumbbell, name: 'Fitness Center', available: false },
    { icon: Sparkles, name: 'Spa Services', available: true },
    { icon: Utensils, name: 'Restaurant', available: true },
    { icon: Coffee, name: 'Coffee Shop', available: true },
    { icon: Car, name: 'Car Rental', available: false },
  ]

  const pricing = (spot.pricing as any) || {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/spots/${slug}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to spot
            </Link>
            <div className="flex items-center">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Image */}
            <div className="lg:col-span-2 flex items-center justify-center">
              <div className="relative w-full max-w-2xl aspect-[16/6] rounded-2xl overflow-hidden">
                <img
                  src={
                    getImageUrl(spot.images[0]) || '/placeholder.svg'
                  }
                  alt={spot.title}
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                {/* Camera badge removed */}
              </div>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {spot.title}
                </h1>
              </div>

              {/* <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Quick Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Check-in</span>
                      <span className="font-medium">3:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Check-out</span>
                      <span className="font-medium">11:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Max Guests</span>
                      <span className="font-medium">4 people</span>
                    </div>
                  </CardContent>
                </Card> */}
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="gap-1">
            <CardHeader>
              <CardTitle className="text-lg">
                About this place
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-2">
              <p className="text-gray-700 leading-relaxed">
                {spot.description}
              </p>
            </CardContent>
            {/* Culture */}
            <CardHeader className="mt-6">
              <CardTitle>Historical</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Ocean Bloom began as a private family beach house
                around 2009 and later opened as a boutique resort,
                reflecting Buenavista’s shift from purely coastal
                livelihood to small-scale hospitality on the Manapa
                shoreline. Its family-run story and location in former
                Tortosa (now Buenavista) tie it to the area’s
                long-standing river–sea travel and coastal settlement
                heritage.
              </p>
            </CardContent>

            <CardHeader className="mt-6">
              <CardTitle>Aesthetic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                The resort blends Mediterranean and rustic Filipino
                design with landscaped beachfront, offering calm sea
                views, black-sand shore, and curated garden spaces for
                an intimate feel. Guests highlight its quiet,
                small-crowd vibe and sunset-facing beachfront as a
                quick, near-Butuan escape.
              </p>
            </CardContent>

            <CardHeader className="mt-6">
              <CardTitle>Scientific</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Positioned in a low-elevation coastal zone near
                river–sea interfaces, the site benefits from tidal and
                nearshore processes that shape beach morphology and
                local biodiversity, making light-touch landscaping and
                runoff control important. Its participation in
                green-leaning initiatives aligns with vegetation
                cover, resource efficiency, and coastal resilience
                practices
              </p>
            </CardContent>

            <CardHeader className="mt-6">
              <CardTitle>Economic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Ocean Bloom draws weekenders and event groups from
                Butuan and nearby towns, supporting local transport,
                provisioning, and service jobs within Buenavista. Its
                boutique events model complements fisheries by
                diversifying tourism revenue along the Manapa coast.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PhilippinePeso className="h-5 w-5 mr-2" />
                Pricing & Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    ₱{pricing.oneNight || '150'}
                  </div>
                  <div className="text-gray-600">per night</div>
                  <div className="text-sm text-gray-500 mt-1">
                    1 night stay
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-teal-50 border-teal-200">
                  <div className="text-2xl font-bold text-gray-900">
                    ₱{pricing.twoNights || '280'}
                  </div>
                  <div className="text-gray-600">total</div>
                  <div className="text-sm text-teal-600 mt-1">
                    2 nights (save 10%)
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    ₱{pricing.pricePerNight || '140'}
                  </div>
                  <div className="text-gray-600">per night</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Weekly rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Amenities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>What this place offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      amenity.available
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <amenity.icon
                      className={`h-5 w-5 ${
                        amenity.available
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        amenity.available
                          ? 'text-gray-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Guest Reviews</span>
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-2">
                    {Array.from({ length: fullStars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400"
                      />
                    ))}
                    {hasHalf && (
                      <StarHalf className="h-4 w-4 fill-yellow-400" />
                    )}
                    {Array.from({ length: emptyStars }).map(
                      (_, i) => (
                        <Star
                          key={`e-${i}`}
                          className="h-4 w-4 opacity-30"
                        />
                      )
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {spot.rating.toFixed(1)} out of 5
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">Sarah M.</span>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                      "Absolutely stunning location! The views were
                      breathtaking and the service was impeccable.
                      Highly recommend for anyone looking for a
                      peaceful getaway."
                    </p>
                    <span className="text-xs text-gray-500">
                      2 weeks ago
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">Michael R.</span>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-yellow-400"
                          />
                        ))}
                        <Star className="h-3 w-3 opacity-30" />
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                      "Great place to stay! The amenities were
                      top-notch and the location was perfect for
                      exploring the area. Will definitely return."
                    </p>
                    <span className="text-xs text-gray-500">
                      1 month ago
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact & Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Location & Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Location
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{spot.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        Check-in: 3:00 PM | Check-out: 11:00 AM
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Contact
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>www.example.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
