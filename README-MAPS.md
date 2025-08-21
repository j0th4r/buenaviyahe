# Google Maps Integration Setup

This project includes an itinerary map feature that displays travel spots with markers and directions using Google Maps JavaScript API.

## 🗺️ Features

- **Interactive Map View**: View all spots for a specific day on a map
- **Spot Markers**: Yellow circular markers showing each location
- **Directions**: Automatic routing between spots in order
- **Info Windows**: Click markers to see spot details
- **Responsive Design**: Works on desktop and mobile

## 🔧 Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:

   - **Maps JavaScript API** (required)
   - **Directions API** (required for route drawing)
   - **Places API** (optional, for enhanced search)

4. Create credentials:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy your API key

### 2. Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Add your Google Maps API key to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 3. API Key Security (Recommended)

For production, restrict your API key:

1. In Google Cloud Console, go to your API key settings
2. Add application restrictions:
   - **HTTP referrers** for web: `yourdomain.com/*`
   - **IP addresses** for development: your development IP
3. Restrict APIs to only the ones you need

## 🎯 How It Works

### Adding Spots to Itinerary

When users add spots to their itinerary, the system now preserves the `lat` and `lng` coordinates from the spots database.

### Viewing Itinerary Map

1. Users go to their plan details page
2. Click "View Whole Itinerary on Map" button for any day
3. The map loads with:
   - Markers for each spot on that day
   - Directions connecting the spots in order
   - Info windows with spot details

### Map Components

- **Map Container**: Full-screen Google Maps instance
- **Markers**: Yellow circular markers with white borders
- **Directions**: Yellow dotted lines connecting spots
- **Info Windows**: Popup details when clicking markers
- **Bottom Panel**: Spot cards with images and details

## 🚀 Usage

### Plan Details Page

```tsx
// The "View Whole Itinerary on Map" button appears for each day
<button
  onClick={() =>
    router.push(`/plans/${itineraryId}/itinerary-map?day=${activeDay}`)
  }
>
  View Whole Itinerary on Map
</button>
```

### Map Page Route

```
/plans/[id]/itinerary-map?day=1
```

## 📱 Mobile Responsive

The map interface is fully responsive with:

- Touch-friendly controls
- Swipeable spot cards
- Optimized marker sizes
- Mobile-first design

## 🛠️ Development

### Testing Locally

1. Make sure your `.env.local` has the API key
2. Start the development server: `npm run dev`
3. Create an itinerary with spots that have coordinates
4. Navigate to a plan and click the map button

### Adding New Features

The map component is located at:

```
app/plans/[id]/itinerary-map/page.tsx
```

Key functions:

- `loadGoogleMapsScript()`: Dynamically loads Google Maps API
- Map initialization with bounds fitting
- Marker creation with custom styling
- Directions service for route drawing

## 🔍 Troubleshooting

### Common Issues

**Map not loading:**

- Check if API key is set in `.env.local`
- Verify API key has Maps JavaScript API enabled
- Check browser console for errors

**No markers showing:**

- Ensure spots have `lat` and `lng` coordinates in database
- Check if spots are properly added to itinerary with coordinates

**Directions not working:**

- Enable Directions API in Google Cloud Console
- Check if multiple spots exist for the day

### Debug Tips

```javascript
// Check if Google Maps loaded
console.log('Google Maps loaded:', !!window.google);

// Check spots with coordinates
console.log(
  'Spots with coords:',
  spotsForDay.filter((s) => s.lat && s.lng)
);
```

## 💰 API Costs

Google Maps usage is typically free for development with generous quotas:

- **Maps JavaScript API**: 28,000 map loads per month free
- **Directions API**: $5 per 1,000 requests after free tier

Monitor usage in Google Cloud Console.
