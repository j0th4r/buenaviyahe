'use client';

import {useSearchParams} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {useMemo, useState, useEffect} from 'react';
import {Calendar} from '@/components/ui/calendar';
import {Input} from '@/components/ui/input';
import type {DateRange} from 'react-day-picker';
import {differenceInCalendarDays, format} from 'date-fns';
import {
  createOrReplace,
  type SpotEntry,
  setItinerary,
  saveItinerary,
} from '@/lib/itinerary-store';
import { useAuth } from '@/hooks/use-auth';
import { BottomTabs } from '@/components/ui/bottom-tabs';
import Link from 'next/link';

export default function NewPlanPage() {
  const search = useSearchParams();
  const { user, loading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const spotTitle = search.get('title')
    ? decodeURIComponent(search.get('title')!)
    : undefined;
  const image = search.get('image')
    ? decodeURIComponent(search.get('image')!)
    : undefined;
  const location = search.get('location')
    ? decodeURIComponent(search.get('location')!)
    : undefined;
  const priceParam = search.get('price');
  const price = priceParam ? Number(priceParam) : undefined;
  const ratingParam = search.get('rating');
  const rating = ratingParam ? Number(ratingParam) : undefined;
  const latParam = search.get('lat');
  const lat = latParam ? Number(latParam) : undefined;
  const lngParam = search.get('lng');
  const lng = lngParam ? Number(lngParam) : undefined;
  const time = search.get('time') || '09:00';

  // Use static year to prevent hydration mismatches due to timezone differences
  const year = 2024;
  const defaultMonth = new Date(year, 7, 1);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [planName, setPlanName] = useState<string>('');

  const nights = useMemo(
    () =>
      range?.from && range?.to
        ? Math.max(0, differenceInCalendarDays(range.to, range.from))
        : 0,
    [range]
  );
  const rangeLabel = useMemo(() => {
    if (range?.from && range?.to)
      return `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d')}`;
    if (range?.from) return `Start: ${format(range.from, 'MMM d')}`;
    return 'Choose a date range';
  }, [range]);

  const handleCreatePlan = async () => {
    if (!range?.from || !range?.to || !planName.trim()) return;
    
    // Check if user is authenticated
    if (!user) {
      alert('Please sign in to create a travel plan');
      return;
    }
    
    setIsCreating(true);
    try {
      let daysInit: Record<number, SpotEntry[]> = {1: []};
      if (spotTitle) {
        const firstSpot: SpotEntry = {
          id:
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `${Date.now()}`,
          title: spotTitle,
          image,
          location,
          pricePerNight: price,
          rating,
          lat,
          lng,
          time,
        };
        daysInit = {1: [firstSpot]};
      }
      
      const itin = createOrReplace({
        title: planName.trim(),
        start: format(range.from, 'yyyy-MM-dd'),
        end: format(range.to, 'yyyy-MM-dd'),
        days: daysInit,
      });
      
      // Save to localStorage immediately
      setItinerary(itin);
      
      // Try to save to Supabase
      try {
        await saveItinerary(itin);
      } catch (error) {
        console.warn('Failed to save to Supabase, continuing with localStorage:', error);
        // Still continue with the flow even if Supabase save fails
      }
      
      const qs = new URLSearchParams({
        from: itin.start!,
        to: itin.end!,
        activeDay: '1',
      }).toString();
      window.location.href = `/planner/itinerary?${qs}`;
    } catch (error) {
      console.error('Failed to create plan:', error);
      alert('Failed to create plan. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <button
            aria-label="Go back"
            onClick={() => history.back()}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">New Plan</h1>
          <div className="w-6" />
        </header>
        
        <div className="rounded-xl border border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Sign in required</h2>
          <p className="text-gray-600 mb-4">Please sign in to create a travel plan</p>
          <a 
            href="/auth/login" 
            className="inline-block rounded-full bg-teal-400 px-6 py-3 text-white font-semibold hover:bg-teal-500"
          >
            Sign In
          </a>
        </div>
        <BottomTabs />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <button
          aria-label="Go back"
          onClick={() => history.back()}
          className="rounded-full p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">New Plan</h1>
        <div className="w-6" />
      </header>

      <div className="relative mb-8 overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <p className="text-sm text-white opacity-95">{location}</p>
          <h2 className="text-2xl font-bold text-white">{spotTitle}</h2>
        </div>
      </div>

      <section className="mb-8">
        <h3 className="mb-3 text-lg font-bold">Plan name</h3>
        <Input
          type="text"
          placeholder="Enter a name for your travel plan"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
        />
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">Select dates</h3>
          <span className="text-sm font-medium text-gray-700">
            {rangeLabel}
          </span>
        </div>
        <div className="rounded-xl border bg-white p-2">
          <Calendar
            mode="range"
            numberOfMonths={1}
            defaultMonth={defaultMonth}
            selected={range}
            onSelect={setRange}
            className="w-full"
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {nights > 0
            ? `${nights} night${nights === 1 ? '' : 's'} selected.`
            : 'Pick a start and end date.'}
        </p>
      </section>

      <button
        disabled={!range?.from || !range?.to || !planName.trim() || isCreating}
        onClick={handleCreatePlan}
        className="w-full rounded-full bg-teal-400 py-4 text-lg font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCreating ? 'Creating...' : 'Next step'}
      </button>
    </div>
  );
}
