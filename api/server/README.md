# Travel Home API Server

A lightweight Python Flask REST API server for serving travel spots data.

## Features

- 🏖️ Complete CRUD operations for travel spots
- 📂 Category-based organization
- ⭐ Reviews and ratings system  
- 🔍 Search functionality
- 📱 CORS enabled for frontend integration
- 🚀 Simple JSON file-based database

## API Endpoints

### Health Check
- `GET /api/health` - Server health check

### Spots
- `GET /api/spots` - Get all spots (supports filtering)
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

## Query Parameters

### Filtering Spots
- `category` - Filter by category
- `popular=true/false` - Filter by popularity
- `featured=true/false` - Filter by featured status
- `limit` - Limit number of results

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

3. Server runs on `http://localhost:3001` by default

## Environment Variables

- `PORT` - Server port (default: 3001)
- `DEBUG` - Debug mode (default: false)

## Examples

```bash
# Get all spots
curl http://localhost:3001/api/spots

# Get popular spots
curl http://localhost:3001/api/spots/popular?limit=3

# Search spots
curl http://localhost:3001/api/search?q=beach

# Get spots by category
curl http://localhost:3001/api/categories/beaches/spots
```
