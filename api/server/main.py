#!/usr/bin/env python3
"""
Travel Home API Server
A simple JSON REST API server for serving travel spots data.
"""

import json
import os
from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename
from flask_cors import CORS
from typing import Dict, List, Any, Optional

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load database
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'db.json')
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PUBLIC_UPLOADS = os.path.join(PROJECT_ROOT, 'public', 'uploads')
os.makedirs(PUBLIC_UPLOADS, exist_ok=True)

def load_database() -> Dict[str, Any]:
    """Load the database from JSON file."""
    try:
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"spots": [], "categories": [], "reviews": [], "itineraries": [], "profile": {}}
    except json.JSONDecodeError:
        return {"spots": [], "categories": [], "reviews": [], "itineraries": [], "profile": {}}

def save_database(data: Dict[str, Any]) -> None:
    """Save the database to JSON file."""
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "OK", "message": "Travel Home API is running"})

# Spots endpoints
@app.route('/api/spots', methods=['GET'])
def get_spots():
    """Get all spots with optional filtering."""
    db = load_database()
    spots = db.get('spots', [])
    
    # Query parameters for filtering
    category = request.args.get('category')
    popular = request.args.get('popular')
    featured = request.args.get('featured')
    limit = request.args.get('limit', type=int)
    
    # Apply filters using tags
    if category:
        spots = [spot for spot in spots if category in spot.get('tags', [])]
    
    if popular is not None:
        popular_bool = popular.lower() == 'true'
        if popular_bool:
            spots = [spot for spot in spots if 'popular' in spot.get('tags', [])]
        else:
            spots = [spot for spot in spots if 'popular' not in spot.get('tags', [])]
    
    if featured is not None:
        featured_bool = featured.lower() == 'true'
        if featured_bool:
            spots = [spot for spot in spots if 'featured' in spot.get('tags', [])]
        else:
            spots = [spot for spot in spots if 'featured' not in spot.get('tags', [])]
    
    # Apply limit
    if limit:
        spots = spots[:limit]
    
    return jsonify({
        "success": True,
        "data": spots,
        "count": len(spots)
    })

@app.route('/api/spots/<string:spot_id>', methods=['GET'])
def get_spot(spot_id: str):
    """Get a specific spot by ID or slug."""
    db = load_database()
    spots = db.get('spots', [])
    
    # Find spot by id or slug
    spot = next((s for s in spots if s.get('id') == spot_id or s.get('slug') == spot_id), None)
    
    if not spot:
        return jsonify({
            "success": False,
            "error": "Spot not found",
            "message": f"No spot found with ID or slug: {spot_id}"
        }), 404
    
    return jsonify({
        "success": True,
        "data": spot
    })

@app.route('/api/spots/popular', methods=['GET'])
def get_popular_spots():
    """Get popular spots."""
    db = load_database()
    spots = db.get('spots', [])
    
    popular_spots = [spot for spot in spots if 'popular' in spot.get('tags', [])]
    limit = request.args.get('limit', default=3, type=int)
    
    return jsonify({
        "success": True,
        "data": popular_spots[:limit],
        "count": len(popular_spots[:limit])
    })

@app.route('/api/spots/featured', methods=['GET'])
def get_featured_spots():
    """Get featured spots."""
    db = load_database()
    spots = db.get('spots', [])
    
    featured_spots = [spot for spot in spots if 'featured' in spot.get('tags', [])]
    limit = request.args.get('limit', default=3, type=int)
    
    return jsonify({
        "success": True,
        "data": featured_spots[:limit],
        "count": len(featured_spots[:limit])
    })

# Categories endpoints
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all categories."""
    db = load_database()
    categories = db.get('categories', [])
    
    return jsonify({
        "success": True,
        "data": categories,
        "count": len(categories)
    })

@app.route('/api/categories/<string:category_id>', methods=['GET'])
def get_category(category_id: str):
    """Get a specific category."""
    db = load_database()
    categories = db.get('categories', [])
    
    category = next((c for c in categories if c.get('id') == category_id), None)
    
    if not category:
        return jsonify({
            "success": False,
            "error": "Category not found",
            "message": f"No category found with ID: {category_id}"
        }), 404
    
    return jsonify({
        "success": True,
        "data": category
    })

@app.route('/api/categories/<string:category_id>/spots', methods=['GET'])
def get_spots_by_category(category_id: str):
    """Get all spots in a specific category."""
    db = load_database()
    spots = db.get('spots', [])
    
    category_spots = [spot for spot in spots if category_id in spot.get('tags', [])]
    limit = request.args.get('limit', type=int)
    
    if limit:
        category_spots = category_spots[:limit]
    
    return jsonify({
        "success": True,
        "data": category_spots,
        "count": len(category_spots),
        "category": category_id
    })

# Reviews endpoints
@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    """Get all reviews with optional filtering by spot."""
    db = load_database()
    reviews = db.get('reviews', [])
    
    spot_id = request.args.get('spotId')
    limit = request.args.get('limit', type=int)
    
    if spot_id:
        reviews = [review for review in reviews if review.get('spotId') == spot_id]
    
    if limit:
        reviews = reviews[:limit]
    
    return jsonify({
        "success": True,
        "data": reviews,
        "count": len(reviews)
    })

@app.route('/api/spots/<string:spot_id>/reviews', methods=['GET'])
def get_spot_reviews(spot_id: str):
    """Get reviews for a specific spot."""
    db = load_database()
    reviews = db.get('reviews', [])
    
    spot_reviews = [review for review in reviews if review.get('spotId') == spot_id]
    limit = request.args.get('limit', type=int)
    
    if limit:
        spot_reviews = spot_reviews[:limit]
    
    return jsonify({
        "success": True,
        "data": spot_reviews,
        "count": len(spot_reviews),
        "spotId": spot_id
    })

# Itinerary endpoints
@app.route('/api/itineraries', methods=['GET'])
def get_itineraries():
    """Get all itineraries."""
    db = load_database()
    itineraries = db.get('itineraries', [])
    
    return jsonify({
        "success": True,
        "data": itineraries,
        "count": len(itineraries)
    })

@app.route('/api/itineraries', methods=['POST'])
def create_itinerary():
    """Create a new itinerary."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "Invalid input",
                "message": "Request body must be valid JSON"
            }), 400

        # Generate a unique ID if not provided
        import uuid
        if 'id' not in data:
            data['id'] = str(uuid.uuid4())

        # Add timestamp
        from datetime import datetime
        data['createdAt'] = datetime.now().isoformat() + 'Z'
        data['updatedAt'] = data['createdAt']

        db = load_database()
        itineraries = db.get('itineraries', [])
        
        # Check if itinerary with same ID already exists
        if any(itin['id'] == data['id'] for itin in itineraries):
            return jsonify({
                "success": False,
                "error": "Conflict",
                "message": f"Itinerary with ID {data['id']} already exists"
            }), 409

        itineraries.append(data)
        db['itineraries'] = itineraries
        save_database(db)

        return jsonify({
            "success": True,
            "data": data,
            "message": "Itinerary created successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/api/itineraries/<string:itinerary_id>', methods=['GET'])
def get_itinerary(itinerary_id: str):
    """Get a specific itinerary by ID."""
    db = load_database()
    itineraries = db.get('itineraries', [])
    
    itinerary = next((itin for itin in itineraries if itin.get('id') == itinerary_id), None)
    
    if not itinerary:
        return jsonify({
            "success": False,
            "error": "Itinerary not found",
            "message": f"No itinerary found with ID: {itinerary_id}"
        }), 404
    
    return jsonify({
        "success": True,
        "data": itinerary
    })

@app.route('/api/itineraries/<string:itinerary_id>', methods=['PUT'])
def update_itinerary(itinerary_id: str):
    """Update an existing itinerary."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "Invalid input",
                "message": "Request body must be valid JSON"
            }), 400

        db = load_database()
        itineraries = db.get('itineraries', [])
        
        # Find the itinerary to update
        itinerary_index = next((i for i, itin in enumerate(itineraries) if itin.get('id') == itinerary_id), None)
        
        if itinerary_index is None:
            return jsonify({
                "success": False,
                "error": "Itinerary not found",
                "message": f"No itinerary found with ID: {itinerary_id}"
            }), 404

        # Update the itinerary
        existing_itinerary = itineraries[itinerary_index]
        updated_itinerary = {**existing_itinerary, **data}
        
        # Update timestamp
        from datetime import datetime
        updated_itinerary['updatedAt'] = datetime.now().isoformat() + 'Z'
        
        # Ensure ID doesn't change
        updated_itinerary['id'] = itinerary_id

        itineraries[itinerary_index] = updated_itinerary
        db['itineraries'] = itineraries
        save_database(db)

        return jsonify({
            "success": True,
            "data": updated_itinerary,
            "message": "Itinerary updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/api/itineraries/<string:itinerary_id>', methods=['DELETE'])
def delete_itinerary(itinerary_id: str):
    """Delete an itinerary."""
    try:
        db = load_database()
        itineraries = db.get('itineraries', [])
        
        # Find the itinerary to delete
        original_count = len(itineraries)
        itineraries = [itin for itin in itineraries if itin.get('id') != itinerary_id]
        
        if len(itineraries) == original_count:
            return jsonify({
                "success": False,
                "error": "Itinerary not found",
                "message": f"No itinerary found with ID: {itinerary_id}"
            }), 404

        db['itineraries'] = itineraries
        save_database(db)

        return jsonify({
            "success": True,
            "message": f"Itinerary {itinerary_id} deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": str(e)
        }), 500

# Search endpoint
@app.route('/api/search', methods=['GET'])
def search_spots():
    """Search spots by title, location, or description."""
    query = request.args.get('q', '').lower()
    category = request.args.get('category')
    limit = request.args.get('limit', default=10, type=int)
    
    if not query:
        return jsonify({
            "success": False,
            "error": "Missing search query",
            "message": "Please provide a search query using the 'q' parameter"
        }), 400
    
    db = load_database()
    spots = db.get('spots', [])
    
    # Search in title, location, description, and tags
    results = []
    for spot in spots:
        tags_text = ' '.join(spot.get('tags', [])).lower()
        if (query in spot.get('title', '').lower() or 
            query in spot.get('location', '').lower() or 
            query in spot.get('description', '').lower() or
            query in tags_text):
            results.append(spot)
    
    # Filter by category if specified
    if category:
        results = [spot for spot in results if category in spot.get('tags', [])]
    
    # Apply limit
    results = results[:limit]
    
    return jsonify({
        "success": True,
        "data": results,
        "count": len(results),
        "query": query
    })

# Profile endpoints
@app.route('/api/profile', methods=['GET'])
def get_profile():
    """Get the single user profile"""
    db = load_database()
    profile = db.get('profile') or {}
    # Provide sane defaults if profile not yet set
    if not profile:
        profile = {
            "name": "Jowehl",
            "city": "Agusan del Norte Province, Philippines",
            "website": "",
            "about": "",
            "joinedYear": 2025,
            "contributions": 0,
            "avatarUrl": "/placeholder-user.jpg",
        }
        db['profile'] = profile
        save_database(db)
    return jsonify({
        "success": True,
        "data": profile
    })

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    """Update the user profile (upsert)"""
    try:
        updates = request.get_json() or {}

        db = load_database()
        current = db.get('profile') or {}
        # Merge update fields
        allowed_keys = {"name", "city", "website", "about", "avatarUrl", "joinedYear", "contributions"}
        merged = {**current}
        for key, value in updates.items():
            if key in allowed_keys:
                merged[key] = value
        if 'joinedYear' not in merged:
            merged['joinedYear'] = 2025
        if 'contributions' not in merged:
            merged['contributions'] = 0
        if 'avatarUrl' not in merged:
            merged['avatarUrl'] = '/placeholder-user.jpg'

        db['profile'] = merged
        save_database(db)
        return jsonify({
            "success": True,
            "data": merged,
            "message": "Profile updated successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/api/profile/avatar', methods=['POST'])
def upload_avatar():
    """Upload an avatar image and store under public/uploads, returning the URL path"""
    try:
        if 'avatar' not in request.files:
            return jsonify({
                "success": False,
                "error": "Bad Request",
                "message": "No file field 'avatar' provided"
            }), 400
        file = request.files['avatar']
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "Bad Request",
                "message": "Empty filename"
            }), 400
        filename = secure_filename(file.filename)
        # Preserve extension, generate unique name
        name, ext = os.path.splitext(filename)
        import time
        unique_name = f"avatar_{int(time.time())}{ext or '.jpg'}"
        save_path = os.path.join(PUBLIC_UPLOADS, unique_name)
        file.save(save_path)

        # Build URL path for Next.js public folder
        url_path = f"/uploads/{unique_name}"

        # Persist to db profile.avatarUrl
        db = load_database()
        profile = db.get('profile') or {}
        profile['avatarUrl'] = url_path
        db['profile'] = profile
        save_database(db)

        return jsonify({
            "success": True,
            "data": {"url": url_path},
            "message": "Avatar uploaded successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Not found",
        "message": "The requested endpoint was not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error",
        "message": "An internal error occurred"
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    
    print(f"🚀 Travel Home API Server starting...")
    print(f"📍 Server will be available at: http://localhost:{port}")
    print(f"📊 Database path: {DB_PATH}")
    print(f"🔧 Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
