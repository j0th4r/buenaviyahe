'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from '@vis.gl/react-google-maps'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const defaultCenter = { lat: 8.9731834, lng: 125.4085344 }

function MapReady({
  onReady,
}: {
  onReady: (map: google.maps.Map) => void
}) {
  const map = useMap()
  useEffect(() => {
    if (map) onReady(map)
  }, [map, onReady])
  return null
}

interface LocationMapPickerProps {
  lat: number | null
  lng: number | null
  onLocationChange: (lat: number | null, lng: number | null) => void
}

export function LocationMapPicker({
  lat,
  lng,
  onLocationChange,
}: LocationMapPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number
    lng: number
  } | null>(() => {
    if (lat !== null && lng !== null) {
      return { lat, lng }
    }
    return null
  })
  const [center, setCenter] = useState(() => {
    if (lat !== null && lng !== null) {
      return { lat, lng }
    }
    return defaultCenter
  })
  const mapRef = useRef<google.maps.Map | null>(null)

  // Update selected position when lat/lng props change (e.g., from initialData)
  useEffect(() => {
    if (lat !== null && lng !== null) {
      const newPosition = { lat, lng }
      setSelectedPosition(newPosition)
      setCenter(newPosition)
      if (mapRef.current) {
        mapRef.current.panTo(newPosition)
        mapRef.current.setZoom(15)
      }
    } else {
      // Clear selection if lat/lng become null
      setSelectedPosition(null)
      setCenter(defaultCenter)
      if (mapRef.current) {
        mapRef.current.panTo(defaultCenter)
        mapRef.current.setZoom(12)
      }
    }
  }, [lat, lng])

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.detail.latLng) {
        const position = {
          lat: e.detail.latLng.lat,
          lng: e.detail.latLng.lng,
        }
        setSelectedPosition(position)
        onLocationChange(position.lat, position.lng)
      }
    },
    [onLocationChange]
  )

  const handleClear = useCallback(() => {
    setSelectedPosition(null)
    onLocationChange(null, null)
    setCenter(defaultCenter)
    if (mapRef.current) {
      mapRef.current.panTo(defaultCenter)
      mapRef.current.setZoom(12)
    }
  }, [onLocationChange])

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      libraries={['marker']}
    >
      <div className="space-y-2">
        <div className="relative h-64 w-full rounded-lg overflow-hidden border border-gray-300">
          <Map
            defaultCenter={center}
            defaultZoom={selectedPosition ? 15 : 12}
            onClick={handleMapClick}
            mapId="6663354a9d71030a54d32b1a"
            gestureHandling="greedy"
            disableDefaultUI={true}
            mapTypeId="roadmap"
            className="w-full h-full"
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

            {selectedPosition && (
              <AdvancedMarker position={selectedPosition}>
                <Pin
                  background="#FFD700"
                  borderColor="#B8860B"
                  glyphColor="#B8860B"
                />
              </AdvancedMarker>
            )}
          </Map>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          {selectedPosition ? (
            <p>
              Selected location:{' '}
              <span className="font-mono text-gray-800">
                {selectedPosition.lat.toFixed(6)},{' '}
                {selectedPosition.lng.toFixed(6)}
              </span>
            </p>
          ) : (
            <p className="text-gray-500">
              Click on the map to set the location coordinates
            </p>
          )}
          {selectedPosition && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-7"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </APIProvider>
  )
}
