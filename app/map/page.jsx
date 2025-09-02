'use client'

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import { Star, StarHalf, Crosshair, Plus, Minus } from 'lucide-react'
import { BottomTabs } from '@/components/ui/bottom-tabs'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { getSpots } from '@/lib/api'
import { getImageUrl } from '@/lib/utils/image'
import Loader from '@/components/ui/loader'

const defaultCenter = { lat: 8.9731834, lng: 125.4085344 }

// Throttle helper for map events
function rafThrottle(fn, ms) {
  let ticking = false,
    last = 0
  return (...args) => {
    const now = performance.now()
    if (ticking || now - last < ms) return
    last = now
    ticking = true
    requestAnimationFrame(() => {
      fn(...args)
      ticking = false
    })
  }
}

function MapReady({ onReady }) {
  const map = useMap()
  useEffect(() => {
    if (map) onReady(map)
  }, [map, onReady])
  return null
}

export default function MapPage() {
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [center, setCenter] = useState(defaultCenter)
  const [zoom, setZoom] = useState(12)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [mapTypeId, setMapTypeId] = useState('satellite')
  const [locationLoading, setLocationLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const mapRef = useRef(null)

  // Use refs for tracking center/zoom without triggering re-renders
  const centerRef = useRef(defaultCenter)
  const zoomRef = useRef(12)

  // Throttled handlers to update refs sparingly
  const handleCenterChanged = useRef(
    rafThrottle((e) => {
      centerRef.current = e.detail.center
    }, 100)
  ).current

  const handleZoomChanged = useRef(
    rafThrottle((e) => {
      zoomRef.current = e.detail.zoom
    }, 100)
  ).current

  // Get user's current location
  useEffect(() => {
    let cancelled = false

    const getUserLocation = () => {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported')
        setLocationLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!cancelled) {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            setCenter(location)
            setUserLocation(location)
            centerRef.current = location
            setLocationLoading(false)
            console.log('User location found:', location)
          }
        },
        (error) => {
          if (!cancelled) {
            console.log('Geolocation error:', error.message)
            setLocationLoading(false)
            // Keep default center if location access is denied
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      )
    }

    getUserLocation()

    return () => {
      cancelled = true
    }
  }, [])

  // Load spots data
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const all = await getSpots()
        const withCoords = (all || []).filter(
          (s) =>
            typeof s.lat === 'number' && typeof s.lng === 'number'
        )
        if (!cancelled) setSpots(withCoords)
      } catch (e) {
        if (!cancelled) setError('Failed to load spots')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Remove the initialCenter logic since we're using user location or default center directly

  // Remove fitBoundsToSpots function since we're removing the Show All Spots button

  // Recenter map on user's location
  const recenterOnUser = useCallback(() => {
    if (!mapRef.current || !userLocation) return
    mapRef.current.panTo(userLocation)
    mapRef.current.setZoom(15)
  }, [userLocation])

  const handleSpotClick = useCallback((spot) => {
    if (spot.lat && spot.lng && mapRef.current) {
      mapRef.current.panTo({ lat: spot.lat, lng: spot.lng })
      mapRef.current.setZoom(15)
    }
    setIsDrawerOpen(false)
  }, [])

  // Optimized zoom functions that work directly with mapRef
  const handleZoomIn = useCallback(() => {
    if (!mapRef.current) return
    const currentZoom = mapRef.current.getZoom() || 12
    const newZoom = Math.min(currentZoom + 1, 20) // Max zoom level 20
    mapRef.current.setZoom(newZoom)
    zoomRef.current = newZoom
  }, [])

  const handleZoomOut = useCallback(() => {
    if (!mapRef.current) return
    const currentZoom = mapRef.current.getZoom() || 12
    const newZoom = Math.max(currentZoom - 1, 1) // Min zoom level 1
    mapRef.current.setZoom(newZoom)
    zoomRef.current = newZoom
  }, [])

  // Rating component
  const Rating = ({ value }) => {
    const full = Math.floor(value)
    const half = value % 1 >= 0.5
    const empty = Math.max(0, 5 - full - (half ? 1 : 0))
    return (
      <div className="my-2 flex items-center">
        {Array.from({ length: full }).map((_, i) => (
          <Star
            key={`f-${i}`}
            className="h-5 w-5 fill-yellow-400 text-yellow-400"
          />
        ))}
        {half && (
          <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e-${i}`} className="h-5 w-5 text-gray-300" />
        ))}
      </div>
    )
  }

  if (loading || locationLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <Loader />
        <span className="mt-4 text-lg text-gray-600">
          {locationLoading
            ? 'Getting your location...'
            : 'Loading map...'}
        </span>
        <BottomTabs />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {error}
          </h3>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      libraries={['marker']}
    >
      <div className="relative h-screen w-full bg-gray-100">
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          onCenterChanged={handleCenterChanged}
          onZoomChanged={handleZoomChanged}
          mapId="6663354a9d71030a54d32b1a"
          gestureHandling="greedy"
          disableDefaultUI={true}
          mapTypeId={mapTypeId}
          className="map-container"
          options={{
            clickableIcons: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false,
            styles: [
              {
                featureType: 'poi',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'poi.business',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'poi.park',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'poi.attraction',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'poi.government',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'poi.medical',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'poi.place_of_worship',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'poi.school',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'poi.sports_complex',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'transit',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'transit.station',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          <MapReady onReady={(m) => (mapRef.current = m)} />

          {/* User location marker */}
          {userLocation && (
            <AdvancedMarker
              position={userLocation}
              title="Your Location"
            >
              <div className="flex items-center justify-center w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </AdvancedMarker>
          )}

          {/* Travel spots markers */}
          {spots.map((spot, idx) => (
            <AdvancedMarker
              key={spot.id}
              position={{ lat: spot.lat, lng: spot.lng }}
              onClick={() => setSelected(spot)}
            >
              <Pin
                background="#FFD700"
                borderColor="#B8860B"
                glyphColor="#B8860B"
              ></Pin>
            </AdvancedMarker>
          ))}

          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
              headerContent={
                <h4 className="font-bold text-[#B8860B]">
                  {selected.title}
                </h4>
              }
            >
              <div className="text-sm">
                <p className="mb-2 text-gray-700">
                  {selected.location}
                </p>
                <a
                  className="text-teal-600 hover:text-teal-700 font-medium"
                  href={`/spots/${selected.slug}`}
                >
                  View details
                </a>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
          <div className="flex rounded-full bg-white p-1 shadow-md">
            <button
              onClick={() => setMapTypeId('roadmap')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                mapTypeId === 'roadmap'
                  ? 'bg-teal-500 text-white'
                  : 'bg-transparent text-gray-800 hover:bg-gray-100'
              }`}
            >
              Road
            </button>
            <button
              onClick={() => setMapTypeId('satellite')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                mapTypeId === 'satellite'
                  ? 'bg-teal-500 text-white'
                  : 'bg-transparent text-gray-800 hover:bg-gray-100'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>

        {/* User Location Button - Positioned below map type controls */}
        {userLocation && (
          <div className="absolute top-20 right-4 z-10">
            <button
              onClick={recenterOnUser}
              className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              title="My Location"
            >
              <Crosshair className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}

        {/* Zoom Controls - Positioned at bottom-right, same level as Discover button */}
        <div className="absolute bottom-24 right-4 z-10">
          <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="flex items-center justify-center w-10 h-10 hover:bg-gray-50 transition-colors border-b border-gray-200"
              title="Zoom In"
            >
              <Plus className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleZoomOut}
              className="flex items-center justify-center w-10 h-10 hover:bg-gray-50 transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Bottom Drawer */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <button className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 bg-teal-500 text-white text-sm px-6 py-3 rounded-full shadow-lg hover:bg-teal-600 transition-colors font-bold">
              Discover
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left pl-6">
              <DrawerTitle className="text-left text-2xl font-bold">
                Must-see attractions
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {spots.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    className="w-64 flex-shrink-0 cursor-pointer rounded-2xl border bg-white p-4 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <img
                      alt={spot.title}
                      className="mb-4 h-40 w-full rounded-xl object-cover"
                      src={getImageUrl(
                        spot.images?.[0] ||
                          '/placeholder.svg?height=160&width=256'
                      )}
                      crossOrigin="anonymous"
                    />
                    <h3 className="font-bold text-lg text-gray-800">
                      {spot.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {spot.location}
                    </p>
                    <Rating value={spot.rating || 4.5} />
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">from</p>
                        <p className="font-semibold text-gray-800">
                          {spot.pricing?.oneNight || '₱100 / night'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {spots.length === 0 && (
                  <div className="w-full py-8 text-center text-gray-500">
                    <p className="text-lg font-medium">
                      No spots available
                    </p>
                    <p className="text-sm">
                      Check back later for new destinations
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <BottomTabs />
      </div>
    </APIProvider>
  )
}
