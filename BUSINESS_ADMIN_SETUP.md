# Business Owner Admin Panel

This document outlines the new business owner admin panel that allows users with the "business_owner" role to manage their assigned spots in the Supabase database.

## Overview

The business admin panel is a separate interface from the main LGU admin panel, designed specifically for business owners to manage their tourist spots. Business owners can only access and modify spots where they are listed as the owner.

## Features

### 1. Dashboard (`/business`)

- Overview of business statistics
- Quick metrics: total spots, reviews, average rating
- Top-performing spots
- Quick action links
- Recent activity feed

### 2. Spot Management (`/business/spots`)

- View all spots owned by the business
- Add new spots (`/business/spots/new`)
- Edit existing spots (`/business/spots/[id]/edit`)
- Delete spots (with proper ownership validation)
- Visual cards showing spot details and performance

### 3. Reviews Management (`/business/reviews`)

- View all reviews for business-owned spots
- Rating distribution analytics
- Review details with customer information
- Organized by spot for easy management

### 4. Profile Management (`/business/profile`)

- Update business information
- Manage contact details and website
- Account settings and role information

## Access Control

### Role-Based Security

- Only users with `business_owner` or `admin` roles can access the business panel
- Business owners can only manage spots where `owner_id` matches their user ID
- All API endpoints include ownership validation
- Automatic redirect to unauthorized page for non-business users

### Authentication Flow

1. User attempts to access `/business/*` route
2. `requireBusinessOwner()` function validates authentication and role
3. If not authenticated: redirect to `/auth/login?redirect=/business`
4. If wrong role: redirect to `/?error=unauthorized`
5. If valid: proceed to requested page

## Database Schema

### Required Fields

The following fields are essential for the business admin panel:

#### `spots` table:

- `owner_id` (uuid): Foreign key to `profiles.id`
- All existing spot fields (title, location, description, etc.)

#### `profiles` table:

- `role` (text): Must include 'business_owner' option
- Existing profile fields (name, city, website, about, etc.)

### Relationships

- `spots.owner_id` → `profiles.id`
- `reviews.spot_id` → `spots.id` (for review management)

## API Endpoints

### Business Spots

- `GET /api/business/spots` - List spots owned by authenticated business
- `POST /api/business/spots` - Create new spot for business
- `GET /api/business/spots/[id]` - Get specific spot (ownership validated)
- `PUT /api/business/spots/[id]` - Update spot (ownership validated)
- `DELETE /api/business/spots/[id]` - Delete spot (ownership validated)

### Business Reviews

- `GET /api/business/reviews` - Get all reviews for business spots

### Business Profile

- `GET /api/business/profile` - Get business profile
- `PUT /api/business/profile` - Update business profile

## File Structure

```
app/
├── business/
│   ├── page.tsx                    # Dashboard
│   ├── spots/
│   │   ├── page.tsx                # Spots listing
│   │   ├── new/
│   │   │   └── page.tsx            # New spot form
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx        # Edit spot form
│   ├── reviews/
│   │   └── page.tsx                # Reviews management
│   └── profile/
│       └── page.tsx                # Profile management
└── api/
    └── business/
        ├── spots/
        │   ├── route.ts            # CRUD operations
        │   └── [id]/
        │       └── route.ts        # Individual spot operations
        ├── reviews/
        │   └── route.ts            # Review fetching
        └── profile/
            └── route.ts            # Profile management

components/
└── admin/
    ├── business-layout.tsx         # Layout wrapper
    ├── business-spot-form.tsx      # Spot creation/editing form
    └── business-profile-form.tsx   # Profile editing form

lib/
└── auth/
    └── admin.ts                    # Authentication functions
```

## Usage Instructions

### For Business Owners

1. **Getting Access**
   - Your account must have the `business_owner` role set in the database
   - Contact the LGU admin to set up your business account

2. **Accessing the Panel**
   - Navigate to `/business` to access your dashboard
   - Use the navigation menu to access different sections

3. **Managing Spots**
   - Add new spots using the "Add New Spot" button
   - Edit existing spots by clicking the "Edit" button on spot cards
   - All spots you create will be automatically assigned to your account

4. **Viewing Reviews**
   - See all reviews for your spots in the Reviews section
   - Monitor your average rating and customer feedback

### For Administrators

1. **Setting Up Business Accounts**
   - Update user's `role` field to `business_owner` in the `profiles` table
   - Business owners will then be able to access the business panel

2. **Managing Ownership**
   - Spots can be assigned to business owners by setting the `owner_id` field
   - Only the owner (or LGU admin) can modify their assigned spots

## Security Features

- **Role Validation**: Every page and API endpoint validates user role
- **Ownership Checks**: Users can only access/modify their own spots
- **Input Validation**: All forms include proper validation and sanitization
- **Authentication**: All routes require valid authentication
- **CSRF Protection**: Forms use proper CSRF protection

## Navigation Integration

The business panel is completely separate from the main LGU admin panel (`/admin`), providing a focused interface for business owners without access to global administrative functions.

## Future Enhancements

Potential features for future development:

- Analytics and reporting
- Photo upload management
- Booking integration
- Customer messaging system
- Promotional tools
- Revenue tracking

## Support

For technical support or to request features, contact the development team or create an issue in the project repository.

