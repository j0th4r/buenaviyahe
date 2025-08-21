'use client';

import React, {useEffect, useState, useMemo, useCallback, useRef} from 'react';
import {useParams, useRouter, useSearchParams} from 'next/navigation';
import {ArrowLeft, Star, StarHalf, ChevronUp, ChevronDown} from 'lucide-react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {getItinerary as getItineraryFromAPI} from '@/lib/api';
import type {Itinerary} from '@/lib/itinerary-store';
import { getImageUrl } from '@/lib/utils/image';

// A default center, in case no spots are available
const defaultCenter = { lat: 8.9731834, lng: 125.4085344 }

// This component will handle rendering multiple direction segments
const Directions = ({
  onRouteCalculated,
  onSegmentCalculated,
  userLocation,
}: {
  onRouteCalculated?: (distance: string, duration: string) => void;
  onSegmentCalculated?: (segments: Array<{from: string, to: string, distance: string, duration: string, color: string}>) => void;
  userLocation?: { lat: number; lng: number } | null;
}) => {
  const map = useMap();
  const [directionsRenderers, setDirectionsRenderers] = useState<google.maps.DirectionsRenderer[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const params = useParams();
  const searchParams = useSearchParams();
  const itineraryId = params.id as string;
  const selectedDay = searchParams.get('day')
    ? parseInt(searchParams.get('day')!)
    : 1;

  useEffect(() => {
    const loadItinerary = async () => {
      const data = await getItineraryFromAPI(itineraryId);
      if (data) {
        setItinerary(data);
      }
    };
    if (itineraryId) {
      loadItinerary();
    }
  }, [itineraryId]);

  const spotsForSelectedDay = useMemo(
    () =>
      itinerary?.days?.[selectedDay]?.filter((spot) => spot.lat && spot.lng) ??
      [],
    [itinerary, selectedDay]
  );

  useEffect(() => {
    // Clean up existing renderers
    directionsRenderers.forEach(renderer => {
      renderer.setMap(null);
    });
    setDirectionsRenderers([]);

    if (!map || spotsForSelectedDay.length < 1) {
      return;
    }

    // Create array of all waypoints including user location
    const allWaypoints = [];
    if (userLocation) {
      allWaypoints.push(userLocation);
    }
    allWaypoints.push(...spotsForSelectedDay.map(spot => ({ lat: spot.lat!, lng: spot.lng! })));

    // Don't show directions if only one waypoint total
    if (allWaypoints.length < 2) {
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const newRenderers: google.maps.DirectionsRenderer[] = [];
    const segmentInfo: Array<{from: string, to: string, distance: string, duration: string, color: string}> = [];
    let totalDistance = 0;
    let totalDuration = 0;
    let completedSegments = 0;
    const totalSegments = allWaypoints.length - 1;

    // Create individual direction segments
    for (let i = 0; i < allWaypoints.length - 1; i++) {
      const origin = allWaypoints[i];
      const destination = allWaypoints[i + 1];
      
      // Use different colors for different segments
      const colors = ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];
      const color = colors[i % colors.length];
      
      // Create readable names for the segment
      const fromName = i === 0 && userLocation ? 'Your Location' : spotsForSelectedDay[userLocation ? i - 1 : i].title;
      const toName = userLocation ? spotsForSelectedDay[i].title : spotsForSelectedDay[i + 1].title;

      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            const renderer = new google.maps.DirectionsRenderer({
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: color,
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
            });

            renderer.setMap(map);
            renderer.setDirections(result);
            newRenderers.push(renderer);

            // Calculate distance and duration for this segment
            const leg = result.routes[0].legs[0];
            const segmentDistance = leg.distance ? leg.distance.value : 0;
            const segmentDuration = leg.duration ? leg.duration.value : 0;
            
            totalDistance += segmentDistance;
            totalDuration += segmentDuration;
            
            // Format segment info
            const segmentDistanceText = segmentDistance > 1000
              ? `${(segmentDistance / 1000).toFixed(1)} km`
              : `${segmentDistance} m`;
            
            const segmentHours = Math.floor(segmentDuration / 3600);
            const segmentMinutes = Math.floor((segmentDuration % 3600) / 60);
            const segmentDurationText = segmentHours > 0
              ? `${segmentHours}h ${segmentMinutes}m`
              : `${segmentMinutes}m`;
            
            // Store segment info
            segmentInfo[i] = {
              from: fromName,
              to: toName,
              distance: segmentDistanceText,
              duration: segmentDurationText,
              color: color
            };
            
            completedSegments++;
            
            // When all segments are complete, update totals and segments
            if (completedSegments === totalSegments) {
              const distanceText = totalDistance > 1000
                ? `${(totalDistance / 1000).toFixed(1)} km`
                : `${totalDistance} m`;
              
              const hours = Math.floor(totalDuration / 3600);
              const minutes = Math.floor((totalDuration % 3600) / 60);
              const durationText = hours > 0
                ? `${hours}h ${minutes}m`
                : `${minutes}m`;
              
              onRouteCalculated?.(distanceText, durationText);
              onSegmentCalculated?.(segmentInfo.filter(Boolean)); // Filter out any undefined entries
            }
          }
        }
      );
    }
    
    setDirectionsRenderers(newRenderers);
  }, [map, spotsForSelectedDay, userLocation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      directionsRenderers.forEach(renderer => {
        renderer.setMap(null);
      });
    };
  }, [directionsRenderers]);

  return null;
};

const MapController = ({
  onMapLoad,
}: {
  onMapLoad: (map: google.maps.Map) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapLoad(map);
    }
  }, [map, onMapLoad]);

  return null;
};

export default function ItineraryMapPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite'>(
    'satellite'
  );
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(12);
  const [totalDistance, setTotalDistance] = useState<string>('');
  const [totalDuration, setTotalDuration] = useState<string>('');
  const [routeSegments, setRouteSegments] = useState<Array<{from: string, to: string, distance: string, duration: string, color: string}>>([]);
  const [isRouteInfoMinimized, setIsRouteInfoMinimized] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);

  const itineraryId = params.id as string;
  const selectedDay = searchParams.get('day')
    ? parseInt(searchParams.get('day')!)
    : 1;

  // Get user's current location
  useEffect(() => {
    let cancelled = false;
    
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        setLocationLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!cancelled) {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(location);
            setLocationLoading(false);
            console.log('User location found:', location);
          }
        },
        (error) => {
          if (!cancelled) {
            console.log('Geolocation error:', error.message);
            setLocationLoading(false);
            // Continue without user location
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    };

    getUserLocation();
    
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const loadItinerary = async () => {
      try {
        setLoading(true);
        const data = await getItineraryFromAPI(itineraryId);
        if (data) {
          setItinerary(data);
        } else {
          setError('Itinerary not found');
        }
      } catch (err) {
        console.error('Failed to load itinerary:', err);
        setError('Failed to load itinerary');
      } finally {
        setLoading(false);
      }
    };

    if (itineraryId) {
      loadItinerary();
    }
  }, [itineraryId]);

  const spotsForSelectedDay = useMemo(
    () =>
      itinerary?.days?.[selectedDay]?.filter((spot) => spot.lat && spot.lng) ??
      [],
    [itinerary, selectedDay]
  );

  const mapCenter = useMemo(() => {
    if (spotsForSelectedDay.length > 0) {
      return {
        lat: spotsForSelectedDay[0].lat!,
        lng: spotsForSelectedDay[0].lng!,
      };
    }
    return defaultCenter;
  }, [spotsForSelectedDay]);

  const handleSpotClick = useCallback((spot: any) => {
    if (spot.lat && spot.lng && mapRef.current) {
      mapRef.current.panTo({lat: spot.lat, lng: spot.lng});
      mapRef.current.setZoom(15);
    }
    setIsDrawerOpen(false);
  }, []);

  const handleRouteCalculated = useCallback((distance: string, duration: string) => {
    setTotalDistance(distance);
    setTotalDuration(duration);
  }, []);

  const handleSegmentCalculated = useCallback((segments: Array<{from: string, to: string, distance: string, duration: string, color: string}>) => {
    setRouteSegments(segments);
  }, []);

  // Rating component
  const Rating = ({value}: {value: number}) => {
    const full = Math.floor(value);
    const half = value % 1 >= 0.5;
    const empty = Math.max(0, 5 - full - (half ? 1 : 0));
    return (
      <div className="my-2 flex items-center">
        {Array.from({length: full}).map((_, i) => (
          <Star
            key={`f-${i}`}
            className="h-5 w-5 fill-yellow-400 text-yellow-400"
          />
        ))}
        {half && (
          <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        )}
        {Array.from({length: empty}).map((_, i) => (
          <Star key={`e-${i}`} className="h-5 w-5 text-gray-300" />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
        <span className="ml-3 text-lg text-gray-600">Loading map...</span>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {error || 'Itinerary not found'}
          </h3>
          <button
            onClick={() => router.back()}
            className="rounded-full bg-teal-500 px-6 py-3 text-white transition-colors hover:bg-teal-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      libraries={['marker']}
    >
      <div className="relative h-screen w-full bg-gray-100">
        <Map
          center={center}
          zoom={zoom}
          onCenterChanged={(e) => setCenter(e.detail.center)}
          onZoomChanged={(e) => setZoom(e.detail.zoom)}
          mapId="6663354a9d71030a54d32b1a"
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapTypeId={mapTypeId}
          className="h-full w-full"
        >
          <MapController onMapLoad={(map) => (mapRef.current = map)} />
          
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
          {spotsForSelectedDay.map((spot, index) => (
            <AdvancedMarker
              key={spot.id}
              position={{lat: spot.lat!, lng: spot.lng!}}
              onClick={() => setSelectedSpot(spot)}
            >
              <Pin
                background={'#FFD700'}
                borderColor={'#B8860B'}
                glyphColor={'#B8860B'}
              >
                {(index + 1).toString()}
              </Pin>
            </AdvancedMarker>
          ))}

          {selectedSpot && (
            <InfoWindow
              position={{
                lat: selectedSpot.lat!,
                lng: selectedSpot.lng!,
              }}
              onCloseClick={() => setSelectedSpot(null)}
              headerContent=<h4 className="font-bold text-[#B8860B]">
                {selectedSpot.title}
              </h4>
             />
            
          )}

          <Directions 
            onRouteCalculated={handleRouteCalculated} 
            onSegmentCalculated={handleSegmentCalculated}
            userLocation={userLocation} 
          />
        </Map>



        {/* Back Button - Fixed Position */}
        <div className="absolute top-4 left-4 z-10 pt-8">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-white p-3 shadow-md transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </button>
        </div>

        {/* Map Controls - Fixed Position */}
        <div className="absolute top-4 right-4 z-10 pt-8">
          <div className="flex flex-col items-end gap-2">
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
            
            {/* Route Info Card */}
            {/* {totalDistance && totalDuration && (spotsForSelectedDay.length > 1 || userLocation) && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex items-center justify-between p-3 pb-2">
                  <div className="text-sm text-gray-600">Route Info</div>
                  <button
                    onClick={() => setIsRouteInfoMinimized(!isRouteInfoMinimized)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {isRouteInfoMinimized ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {!isRouteInfoMinimized && (
                  <div className="px-3 pb-3">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-gray-800">{totalDistance}</span>
                        <span className="text-sm text-gray-500">total distance</span>
                      </div>
                      <div className="w-px h-6 bg-gray-300"></div>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-gray-800">{totalDuration}</span>
                        <span className="text-sm text-gray-500">total time</span>
                      </div>
                    </div>
                    
                  
                    {routeSegments.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-600 mb-2">Route Segments:</div>
                        {routeSegments.map((segment, index) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: segment.color }}
                              ></div>
                              <span className="text-gray-700">{segment.from} → {segment.to}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span>{segment.distance}</span>
                              <span>{segment.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )} */}
          </div>
        </div>

        {/* Bottom Drawer */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <button className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-teal-500 text-white text-sm px-6 py-3 rounded-full shadow-lg hover:bg-teal-600 transition-colors font-bold">
              View Itinerary Details
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                Day {selectedDay} - {itinerary.title}
              </DrawerTitle>
              {totalDistance && totalDuration && (spotsForSelectedDay.length > 1 || userLocation) && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{totalDistance}</div>
                      <div className="text-sm text-gray-500">Total Distance</div>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{totalDuration}</div>
                      <div className="text-sm text-gray-500">Travel Time</div>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{spotsForSelectedDay.length}</div>
                      <div className="text-sm text-gray-500">Stops</div>
                    </div>
                  </div>
                  
                  {/* Route Segments in Drawer */}
                  {routeSegments.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium text-gray-600 mb-2">Route Details:</div>
                      <div className="space-y-1">
                        {routeSegments.map((segment, index) => (
                          <div key={index} className="flex items-start justify-between text-sm">
                            <div className="flex items-start space-x-2 flex-1 min-w-0">
                              <div 
                                className="w-2 h-2 rounded-full mt-1 flex-shrink-0" 
                                style={{ backgroundColor: segment.color }}
                              ></div>
                              <div className="text-gray-700 text-xs leading-tight min-w-0 text-left">
                                <div className="truncate text-left">{segment.from}</div>
                                <div className="truncate text-left">→ {segment.to}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 flex-shrink-0 ml-2">
                              <span>{segment.distance}</span>
                              <span>•</span>
                              <span>{segment.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DrawerHeader>
            <div className="px-4 pb-4">
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {spotsForSelectedDay.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    className="w-64 flex-shrink-0 cursor-pointer rounded-2xl border bg-white p-4 shadow-md"
                  >
                    <img
                      alt={spot.title}
                      className="mb-4 h-40 w-full rounded-xl object-cover"
                      src={getImageUrl(spot.image || '/placeholder.svg?height=160&width=256')}
                      crossOrigin="anonymous"
                    />
                    <h3 className="font-bold text-lg text-gray-800">
                      {spot.title}
                    </h3>
                    <Rating value={spot.rating || 4.5} />
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">from</p>
                        <p className="font-semibold text-gray-800">
                          ₱{spot.pricePerNight || 100} / night
                        </p>
                      </div>
                    </div>
                    {spot.time && (
                      <div className="mt-2 text-sm text-gray-600">
                        Scheduled: {spot.time}
                      </div>
                    )}
                  </div>
                ))}

                {spotsForSelectedDay.length === 0 && (
                  <div className="w-full py-8 text-center text-gray-500">
                    <p className="text-lg font-medium">
                      No spots planned for this day
                    </p>
                    <p className="text-sm">
                      Add some destinations to see them on the map
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </APIProvider>
  );
}
