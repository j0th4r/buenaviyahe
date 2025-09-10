# Admin Dashboard Setup Guide

This guide will help you set up the admin dashboard for your Buena Viyahe tourist spot management system.

## 🚀 Getting Started

### 1. Database Migration

First, you need to add role-based authentication to your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the migration script located at `migrations/add_user_roles.sql`

This will:

- Add a `role` column to the profiles table
- Set up RLS (Row Level Security) policies for admin access
- Create helper functions for role checking

### 2. Create Admin Users

After running the migration, you need to create admin or business owner accounts:

#### Option A: Update existing user

```sql
-- Replace 'your-user-id-here' with the actual user ID
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id-here';

-- Or for business owner role
UPDATE profiles SET role = 'business_owner' WHERE id = 'your-user-id-here';
```

#### Option B: Create new admin profile

1. Register a new user through your app's normal registration flow
2. Find their user ID in the Supabase auth dashboard
3. Update their role using the SQL above

### 3. Environment Variables

Ensure you have the following environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The service role key is essential for admin operations and should only be used server-side.

## 📊 Admin Dashboard Features

### 🏠 Dashboard Overview

- **URL**: `/admin`
- **Features**:
  - Key performance metrics
  - Quick action buttons
  - Top performing spots
  - Recent activity feed

### 🏛️ Listings Management

- **URL**: `/admin/listings`
- **Features**:
  - View all tourist spots
  - Create new listings
  - Edit existing listings
  - Delete listings
  - Upload photos
  - Manage amenities and tags

### 💬 Reviews Management

- **URL**: `/admin/reviews`
- **Features**:
  - Review inbox with filters
  - Respond to customer reviews
  - Track response rates
  - Monitor review trends
  - Flag inappropriate content

### 📈 Analytics Dashboard

- **URL**: `/admin/analytics`
- **Features**:
  - Performance metrics
  - Review trends and ratings
  - Top performing locations
  - Growth insights

### 📸 Photo Upload

- **URL**: `/admin/upload`
- **Features**:
  - Drag & drop file upload
  - URL-based image addition
  - Assign photos to specific listings
  - Image optimization

## 🔐 Role-Based Access

### Admin (`role: 'admin'`)

- Full access to all features
- Can manage any listing
- Can respond to all reviews
- Access to all analytics

### Business Owner (`role: 'business_owner'`)

- Can manage their own listings
- Can respond to reviews for their spots
- Access to analytics for their locations

### Regular User (`role: 'user'`)

- No admin dashboard access
- Standard app functionality only

## 🛡️ Security Features

- **Server-side authentication**: All admin operations require valid authentication
- **Role verification**: Each admin page checks user permissions
- **RLS policies**: Database-level security for data access
- **API route protection**: All admin APIs verify user roles

## 🔧 API Endpoints

### Spots Management

- `GET /api/admin/spots` - List all spots
- `POST /api/admin/spots` - Create new spot
- `GET /api/admin/spots/[id]` - Get specific spot
- `PATCH /api/admin/spots/[id]` - Update spot
- `DELETE /api/admin/spots/[id]` - Delete spot

### Reviews Management

- `GET /api/admin/reviews` - List reviews with filters
- `POST /api/admin/reviews/[id]` - Respond to review
- `DELETE /api/admin/reviews/[id]` - Delete review

## 🎨 UI Components

The admin dashboard uses a consistent design system:

- **Layout**: `AdminLayout` component with sidebar navigation
- **Forms**: Validated forms using React Hook Form + Zod
- **Tables**: Sortable and filterable data tables
- **Cards**: Information display cards with metrics
- **Responsive**: Mobile-first responsive design

## 📱 Mobile Support

The admin dashboard is fully responsive and works on:

- Desktop (primary experience)
- Tablets (optimized layout)
- Mobile phones (collapsible navigation)

## 🚨 Troubleshooting

### "Unauthorized" Error

- Check that your user has the correct role (`admin` or `business_owner`)
- Verify the migration was run successfully
- Ensure RLS policies are active

### Database Permission Issues

- Confirm the service role key is set correctly
- Check that RLS policies allow the user's role to access data

### Missing Data

- Verify the user is authenticated
- Check browser console for API errors
- Ensure database connections are working

## 🔄 Updates and Maintenance

To update the admin dashboard:

1. Pull the latest code changes
2. Run any new migrations
3. Update environment variables if needed
4. Test admin functionality

Remember to always test admin features in a development environment before deploying to production.
