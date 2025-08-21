export type SpotEntry = {
  id: string;
  title: string;
  image?: string;
  location?: string;
  rating?: number;
  time?: string; // "HH:mm"
  // New: pricing per spot (per night)
  pricePerNight?: number;
  // Coordinates for map display
  lat?: number;
  lng?: number;
};

export type ItinerarySpot = SpotEntry;

export type DaySpots = Record<number, ItinerarySpot[]>;

export type Itinerary = {
  id: string;
  title?: string;
  start?: string; // ISO date (yyyy-MM-dd)
  end?: string; // ISO date (yyyy-MM-dd)
  days?: DaySpots;
};

const KEY = 'travel.currentItinerary.v1';

// API functions for server-side storage
async function saveItineraryToAPI(itin: Itinerary): Promise<Itinerary> {
  try {
    const { createItinerary, updateItinerary, getItinerary: getItineraryFromAPI } = await import('./api/itineraries')
    const { supabase } = await import('./supabase/config')
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to save itineraries')
    }
    
    // Check if itinerary already exists
    try {
      const existingItinerary = await getItineraryFromAPI(itin.id);
      if (existingItinerary) {
        // Update existing itinerary
        const result = await updateItinerary(itin.id, {
          title: itin.title,
          start: itin.start,
          end: itin.end,
          days: itin.days,
        })
        setItinerary(result) // <- keep local in sync with server (includes server id)
        return result
      }
    } catch (error) {
      // If getItinerary fails (e.g., 404), continue to create new
    }
    
    // Create new itinerary if it doesn't exist
    const result = await createItinerary({
      title: itin.title,
      start: itin.start,
      end: itin.end,
      days: itin.days,
    }, user.id)
    setItinerary(result) // <- write server-generated id locally
    return result
  } catch (error) {
    console.warn('Failed to save to Supabase, falling back to localStorage:', error)
    // Fallback to localStorage on API failure
    setItinerary(itin)
    return itin
  }
}

async function updateItineraryInAPI(itin: Itinerary): Promise<Itinerary> {
  try {
    const { updateItinerary } = await import('./api/itineraries')
    const result = await updateItinerary(itin.id, {
      title: itin.title,
      start: itin.start,
      end: itin.end,
      days: itin.days,
    })
    setItinerary(result) // <- keep local in sync with server
    return result
  } catch (error) {
    console.warn('Failed to update in Supabase, falling back to localStorage:', error)
    // Fallback to localStorage on API failure
    setItinerary(itin)
    return itin
  }
}

function safeParse<T>(str: string | null): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

export function setItinerary(itin: Itinerary) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(itin));
}

export async function saveItinerary(itin: Itinerary): Promise<Itinerary> {
  // Save to localStorage immediately for offline access
  setItinerary(itin);

  // Also save to Supabase for persistence across devices
  return await saveItineraryToAPI(itin);
}

export async function updateItinerary(itin: Itinerary): Promise<Itinerary> {
  // Update localStorage immediately
  setItinerary(itin);

  // Also update in Supabase
  return await updateItineraryInAPI(itin);
}

function normalize(itin: Itinerary | null): Itinerary | null {
  if (!itin) return null;
  if (!itin.days) {
    // Create empty days structure instead of migrating from spots
    const migrated: Itinerary = {...itin, days: {1: []}};
    setItinerary(migrated);
    return migrated;
  }
  return itin;
}

export function getItinerary(): Itinerary | null {
  if (typeof window === 'undefined') return null;
  const raw = safeParse<Itinerary>(window.localStorage.getItem(KEY));
  return normalize(raw);
}

export function clearItinerary() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}

export function createOrReplace(itin: Partial<Itinerary>) {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;
  const initialDays: DaySpots | undefined = itin.days ?? {1: []};
  const newItin: Itinerary = {
    id,
    title: itin.title,
    start: itin.start,
    end: itin.end,
    days: initialDays,
  };
  setItinerary(newItin);
  return newItin;
}

export async function createOrReplaceAsync(
  itin: Partial<Itinerary>
): Promise<Itinerary> {
  const newItin = createOrReplace(itin);
  // Save to Supabase as well
  return await saveItineraryToAPI(newItin);
}

export async function confirmBooking(): Promise<Itinerary | null> {
  const currentItinerary = getItinerary();
  if (!currentItinerary) {
    console.warn('No itinerary found to confirm booking');
    return null;
  }

  try {
    // Check if this itinerary already exists in Supabase
    const { getItinerary: getItineraryFromAPI } = await import('./api/itineraries')
    let savedItinerary: Itinerary;
    
    try {
      // Try to get the existing itinerary from Supabase
      const existingItinerary = await getItineraryFromAPI(currentItinerary.id);
      if (existingItinerary) {
        // Update the existing itinerary
        const { updateItinerary } = await import('./api/itineraries')
        savedItinerary = await updateItinerary(currentItinerary.id, {
          title: currentItinerary.title,
          start: currentItinerary.start,
          end: currentItinerary.end,
          days: currentItinerary.days,
        });
      } else {
        // Create new itinerary if it doesn't exist
        savedItinerary = await saveItineraryToAPI(currentItinerary);
      }
    } catch (error) {
      // If getItinerary fails (e.g., 404), create a new itinerary
      savedItinerary = await saveItineraryToAPI(currentItinerary);
    }

    // Clear localStorage after successful save to avoid conflicts with new plans
    setTimeout(() => {
      clearItinerary();
    }, 1000);

    return savedItinerary;
  } catch (error) {
    console.error('Failed to confirm booking:', error);
    // Don't clear localStorage if save failed, so user doesn't lose their work
    throw error;
  }
}

export function appendSpot(spot: Omit<SpotEntry, 'id'>, dayIndex = 1) {
  const current = getItinerary();
  const newSpot: SpotEntry = {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    ...spot,
  };
  if (!current) {
    const itin = createOrReplace({days: {[dayIndex]: [newSpot]}});
    return {itinerary: itin, spot: newSpot};
  }
  const days: DaySpots = {...(current.days ?? {1: []})};
  const list = days[dayIndex] ? [...days[dayIndex], newSpot] : [newSpot];
  const next: Itinerary = {...current, days: {...days, [dayIndex]: list}};
  setItinerary(next);
  return {itinerary: next, spot: newSpot};
}

export async function appendSpotAsync(
  spot: Omit<SpotEntry, 'id'>,
  dayIndex = 1
): Promise<{itinerary: Itinerary; spot: SpotEntry}> {
  const result = appendSpot(spot, dayIndex);
  // Update in Supabase
  try {
    await updateItineraryInAPI(result.itinerary);
  } catch (error) {
    console.warn('Failed to sync spot addition to Supabase:', error);
  }
  return result;
}

export function removeSpot(spotId: string, dayIndex?: number) {
  const current = getItinerary();
  if (!current) return null;
  const days: DaySpots = {...(current.days ?? {1: []})};
  if (dayIndex && days[dayIndex]) {
    days[dayIndex] = days[dayIndex].filter((s) => s.id !== spotId);
  } else {
    for (const key of Object.keys(days)) {
      const k = Number(key);
      days[k] = days[k].filter((s) => s.id !== spotId);
    }
  }
  const next: Itinerary = {...current, days};
  setItinerary(next);
  return next;
}

export function updateSpotTime(
  spotId: string,
  time: string,
  dayIndex?: number
) {
  const current = getItinerary();
  if (!current) return null;
  const days: DaySpots = {...(current.days ?? {1: []})};
  const updateDay = (k: number) => {
    days[k] = (days[k] || []).map((s) => (s.id === spotId ? {...s, time} : s));
  };
  if (dayIndex && days[dayIndex]) {
    updateDay(dayIndex);
  } else {
    for (const key of Object.keys(days)) updateDay(Number(key));
  }
  const next: Itinerary = {...current, days};
  setItinerary(next);
  return next;
}

// Helpers

export function getDaysCount(itin: Itinerary): number {
  if (itin.start && itin.end) {
    try {
      const start = new Date(itin.start);
      const end = new Date(itin.end);
      const diff =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      if (diff > 0) return diff;
    } catch {}
  }
  const keys = Object.keys(itin.days ?? {1: []});
  return Math.max(3, keys.length);
}

export function getNights(itin: Itinerary | null): number {
  if (!itin?.start || !itin?.end) return 1;
  try {
    const start = new Date(itin.start);
    const end = new Date(itin.end);
    const nights = Math.max(
      1,
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    return nights;
  } catch {
    return 1;
  }
}

// Fallback deterministic price (used if a spot lacks pricePerNight)
export function fallbackPricePerNight(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i++)
    hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  const base = 80 + (hash % 121); // 80..200
  return Math.round(base / 10) * 10;
}
