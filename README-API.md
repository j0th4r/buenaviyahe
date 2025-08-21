# Travel Home API Setup

This project now includes a complete REST API architecture using a Python JSON server with organized data structure following the single responsibility principle.

## 🏗️ Architecture Overview

The project is organized with clear separation of concerns:

```
travel-home-ui/
├── api/                     # API Layer
│   ├── database/            # Data Storage
│   │   └── db.json         # JSON database with spots, categories, reviews
│   ├── server/              # Python Flask REST API Server
│   │   ├── main.py         # Main server application
│   │   ├── requirements.txt # Python dependencies
│   │   └── README.md       # Server documentation
│   └── types/               # TypeScript type definitions
│       └── index.ts        # Centralized API types
├── lib/api/                 # Frontend API Integration
│   ├── client.ts           # HTTP client with error handling
│   ├── config.ts           # API configuration & endpoints
│   ├── spots.ts            # Spots API slice
│   ├── categories.ts       # Categories API slice
│   ├── reviews.ts          # Reviews API slice
│   ├── hooks.ts            # React hooks for data fetching
│   └── index.ts            # Centralized exports
└── scripts/                # Utility Scripts
    ├── start-api.py        # Cross-platform API starter
    ├── start-api.bat       # Windows batch script
    └── start-api.sh        # Unix/Linux/macOS script
```

## 🚀 Quick Start

### 1. Start the API Server

Choose your platform:

**Windows:**
```bash
scripts\start-api.bat
```

**Unix/Linux/macOS:**
```bash
./scripts/start-api.sh
```

**Manual (any platform):**
```bash
cd api/server
pip install -r requirements.txt
python main.py
```

The API server will start at `http://localhost:3001`

### 2. Start the Frontend

In a separate terminal:

```bash
npm run dev
# or
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## 📊 Database Structure

The `api/database/db.json` file contains:

- **Spots**: Travel locations with details, images, pricing, ratings
- **Categories**: Organized groupings (beaches, waterparks, cliffs, restaurants)  
- **Reviews**: User reviews and ratings for spots

## 🔌 API Endpoints

### Spots
- `GET /api/spots` - Get all spots (supports filtering)
  - Query params: `category`, `popular`, `featured`, `limit`
- `GET /api/spots/{id}` - Get specific spot by ID or slug
- `GET /api/spots/popular` - Get popular spots
- `GET /api/spots/featured` - Get featured spots

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get specific category
- `GET /api/categories/{id}/spots` - Get spots by category

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/spots/{id}/reviews` - Get reviews for specific spot

### Search
- `GET /api/search?q={query}` - Search spots by title, location, description

## 🎣 Using API Hooks

The frontend includes custom React hooks for easy data fetching:

```tsx
import { useSpots, usePopularSpots, useCategories } from '@/lib/api'

function MyComponent() {
  const { data: spots, loading, error } = useSpots({ limit: 10 })
  const { data: popular } = usePopularSpots(3)
  const { data: categories } = useCategories()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {spots?.map(spot => (
        <div key={spot.id}>{spot.title}</div>
      ))}
    </div>
  )
}
```

## 🛠️ Development

### Adding New Spots

Edit `api/database/db.json` and add new entries to the `spots` array:

```json
{
  "id": "new-spot",
  "title": "New Spot",
  "slug": "new-spot", 
  "location": "Location",
  "description": "Description...",
  "category": "beaches",
  "images": ["image1.jpg"],
  "rating": 4.5,
  "reviews": 10,
  "pricing": {
    "oneNight": "from ₱100",
    "twoNights": "from ₱180",
    "pricePerNight": 100
  },
  "amenities": ["Amenity 1", "Amenity 2"],
  "featured": false,
  "popular": true
}
```

### API Client Features

- ✅ Automatic retries with exponential backoff
- ✅ Request/response interceptors
- ✅ Error handling and custom error types
- ✅ Query parameter building
- ✅ TypeScript type safety
- ✅ CORS enabled for frontend integration

### Environment Variables

The API server supports these environment variables:

- `PORT` - Server port (default: 3001)
- `DEBUG` - Debug mode (default: false)

## 🔧 Troubleshooting

### API Server Won't Start

1. Ensure Python 3.7+ is installed
2. Check if port 3001 is available
3. Install dependencies: `pip install -r api/server/requirements.txt`

### Frontend Can't Connect to API

1. Verify the API server is running at `http://localhost:3001`
2. Check the browser console for CORS errors
3. Test API endpoints directly: `curl http://localhost:3001/api/health`

### Data Not Loading

1. Check the API server logs for errors
2. Verify `api/database/db.json` exists and is valid JSON
3. Test individual API endpoints with curl or Postman

## 📝 Next Steps

- Add user authentication
- Implement data persistence beyond JSON files
- Add real-time features with WebSockets
- Implement caching with Redis
- Add API rate limiting and security features






