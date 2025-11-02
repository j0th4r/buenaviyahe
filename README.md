# 🏝️ Buena Viyahe - Tourism Management Platform

**Welcome to Product Demo Day! 🎉**

Buena Viyahe is a comprehensive tourism management platform that connects tourists, local government, and businesses in one unified ecosystem. Built with Next.js 15, TypeScript, Supabase, and powered by AI.

---

## 🌟 **THREE-SIDED PLATFORM OVERVIEW**

Our platform serves three distinct user groups, each with tailored experiences and powerful features:

### 👤 **TOURIST/VISITOR EXPERIENCE**

_Discover, Plan, and Explore Buenavista_

### 🏛️ **LGU ADMIN DASHBOARD**

_Municipal Tourism Management System_

### 🏢 **BUSINESS ADMIN PANEL**

_Business Owner Management Hub_

---

## 🧳 **TOURIST/VISITOR FEATURES**

### 🏠 **Homepage & Discovery** (`/`)

**The Gateway to Buenavista**

- **Smart Search Bar**: Instant search with real-time results and debounced queries
- **Popular Locations Carousel**: Showcases top-rated tourist spots with ratings and pricing
- **Category Browse**: Visual category cards (beaches, restaurants, activities, etc.)
- **Responsive Design**: Mobile-first with seamless desktop experience
- **Forward Navigation**: Maintains user flow when navigating from itinerary planning

### 🗺️ **Interactive Map Experience** (`/map`)

**Explore Buenavista Visually**

- **Google Maps Integration**: Satellite and road view options
- **Dynamic Markers**: Golden pins for all tourist spots with info windows
- **User Location**: Blue dot showing current position with "My Location" button
- **Discover Drawer**: Scrollable spot cards with images, ratings, and pricing
- **Map Controls**: Zoom in/out, map type switcher, custom styling
- **Spot Details**: Click markers to view spot information and navigate to details

### 📱 **Spot Details & Reviews** (`/spots/[slug]`)

**Comprehensive Location Information**

- **High-Quality Image Galleries**: Supabase storage integration
- **Detailed Descriptions**: Rich content with amenities and features
- **Pricing Information**: Clear pricing structure for different services
- **Star Ratings System**: Aggregate ratings from user reviews
- **Location Data**: Address, coordinates, and map integration
- **Review Management**: Read and submit reviews for spots

### 📅 **Trip Planning Suite**

#### **New Plan Creation** (`/planner/new`)

- **Date Range Picker**: Calendar-based trip duration selection
- **Plan Naming**: Custom itinerary titles
- **Spot Integration**: Pre-populate from spot detail pages
- **Authentication Required**: Secure trip planning for logged-in users

#### **Itinerary Builder** (`/planner/itinerary`)

- **Day-by-Day Planning**: Organize spots by travel days
- **Drag & Drop Interface**: Reorder and schedule activities
- **Time Management**: Set visit times for each spot
- **Visual Itinerary**: Image-rich planning interface

#### **My Plans Dashboard** (`/plans`)

- **Saved Itineraries**: View all created travel plans
- **Trip Overview Cards**: Display dates, duration, and spot count
- **Quick Access**: Navigate to detailed itinerary views
- **Plan Management**: Edit, delete, and share travel plans

### 👤 **Profile & Account Management** (`/profile`)

**Personalized User Experience**

- **Profile Editing** (`/profile/edit`): Update personal information and preferences
- **Account Settings**: Manage login credentials and preferences
- **Trip History**: Access to all planned and completed trips

### 🗂️ **Category Browse** (`/categories`)

**Organized Discovery Experience**

- **Category Listings**: Browse spots by type (beaches, restaurants, attractions)
- **Dynamic Category Pages** (`/categories/[categoryId]`): Filtered spot listings
- **Visual Category Cards**: Engaging images with pricing information

### 🤖 **AI-Powered Chatbot** (Site-wide)

**Meet Sean the Explorer**

- **Smart Tourism Assistant**: Ask about spots, activities, and travel tips
- **Context-Aware Responses**: Understands Buenavista-specific queries
- **Conversational Interface**: Natural language interaction
- **Floating Widget**: Always accessible chat interface
- **Powered by Gemini AI**: Advanced language understanding

### 🔐 **Authentication System** (`/auth`)

- **Secure Login/Register** (`/auth/login`, `/auth/register`): Email-based authentication
- **Email Verification** (`/check-email`): Secure account activation
- **Session Management**: Persistent login across devices

---

## 🏛️ **LGU ADMIN DASHBOARD**

_Local Government Unit Tourism Management System_

### 📊 **Main Dashboard** (`/admin`)

**Command Center for Tourism Management**

- **Key Performance Metrics**: Tourism statistics, spot counts, user engagement
- **Tourism Activity Charts**: Visual analytics of visitor patterns
- **Recent Activity Feed**: Live updates on business registrations, spot approvals, and user activity
- **Quick Actions Panel**: Direct access to common admin tasks
- **Spots Overview Table**: Status monitoring of all tourist locations

### 🏢 **Business Registration Management** (`/admin/business-registration`)

**Control Business Onboarding Process**

- **Registration Overview**: Statistics on business applications
- **Business Owner Verification**: Approve/reject business registrations
- **Onboarding Workflow**: Streamlined process for new businesses
- **Business Statistics Dashboard**: Track registration trends and metrics

### 🏪 **Business Details & Monitoring** (`/admin/business-details`)

**Comprehensive Business Oversight**

- **Business Profile Management**: View and edit business information
- **Spot Assignment**: Assign ownership of tourist spots to businesses
- **Performance Monitoring**: Track business metrics and performance
- **Business Contact Management**: Maintain business owner information
- **Modal Detail Views**: In-depth business profile examination

### ✅ **Spot Approval System** (`/admin/spot-approvals`)

**Quality Control for Tourist Spots**

- **Pending Approvals Queue**: Review new spot submissions
- **Approval Workflow**: Accept, reject, or request modifications
- **Quality Standards**: Ensure spots meet municipal standards
- **Batch Processing**: Efficient approval of multiple spots
- **Status Management**: Track approval progress and history

### 👥 **User Management** (`/admin/user-management`)

**Platform User Administration**

- **User Directory**: Complete list of platform users
- **Role Management**: Assign user roles (admin, business_owner, user)
- **User Analytics**: Track user engagement and activity
- **Account Moderation**: Suspend or activate user accounts
- **Role-Based Permissions**: Control access levels

### 📈 **Reports & Analytics** (`/admin/reports`)

**Data-Driven Tourism Insights**

- **Tourism Analytics Dashboard**: Comprehensive performance metrics
- **Visitor Statistics**: Track tourism trends and patterns
- **Revenue Analytics**: Monitor economic impact
- **Spot Performance**: Identify top-performing locations
- **Custom Date Ranges**: Flexible reporting periods

### ⚙️ **System Settings** (`/admin/settings`)

**Platform Configuration Management**

- **General Settings**: LGU information and branding
- **Security Configuration**: Authentication and access controls
- **Notification Preferences**: Email and system alerts
- **Feature Toggles**: Enable/disable platform features
- **System Maintenance**: Maintenance mode controls

---

## 🏢 **BUSINESS ADMIN PANEL**

_Business Owner Management Hub_

### 🏠 **Business Dashboard** (`/business`)

**Your Business Performance Center**

- **Key Performance Metrics**: Spot count, reviews, ratings, and revenue
- **Top Spots Ranking**: Your highest-rated locations
- **Revenue Analytics**: Track earnings across all properties
- **Quick Action Links**: Direct access to management functions
- **Recent Activity**: Latest reviews and performance updates

### 🏝️ **Spot Management Suite** (`/business/spots`)

#### **Spots Overview** (`/business/spots`)

- **My Locations Dashboard**: Visual cards showing all owned spots
- **Performance Metrics**: Individual spot ratings and review counts
- **Quick Actions**: Edit, delete, and manage each location
- **Add New Spot**: Quick access to spot creation

#### **Add New Spot** (`/business/spots/new`)

- **Comprehensive Spot Form**: Title, description, pricing, amenities
- **Image Upload System**: Multiple image upload with Supabase storage
- **Location Mapping**: GPS coordinate integration
- **Pricing Configuration**: Flexible pricing structure setup
- **Tags & Categories**: Proper spot categorization

#### **Edit Spot** (`/business/spots/[id]/edit`)

- **Full Editing Interface**: Modify all spot details
- **Image Management**: Add, remove, and reorder spot photos
- **Ownership Validation**: Security checks for spot ownership
- **Real-time Updates**: Changes reflected immediately

### ⭐ **Review Management** (`/business/reviews`)

**Customer Feedback Hub**

- **Review Dashboard**: All reviews for your spots in one place
- **Rating Analytics**: Average ratings and review distribution
- **Customer Insights**: Understanding guest feedback patterns
- **Review Organization**: Grouped by spot for easy management
- **Response Management**: (Future feature) Respond to customer reviews

### 📊 **Business Analytics** (`/business/analytics`)

**Performance Insights Dashboard**

- **Detailed Analytics Charts**: Visual representation of business metrics
- **Performance Trends**: Track growth and patterns over time
- **Comparative Analysis**: Benchmark against industry standards
- **Revenue Tracking**: Comprehensive financial performance
- **Data Export**: Download reports for external analysis

### 👤 **Business Profile** (`/business/profile`)

**Manage Your Business Identity**

- **Profile Information**: Business name, contact details, description
- **Account Settings**: Login credentials and security
- **Business Verification**: Maintain verified status
- **Contact Management**: Update business contact information

---

## 🛠️ **TECHNICAL ARCHITECTURE**

### **Frontend Technology Stack**

- **Next.js 15** with App Router for modern React development
- **TypeScript** for type-safe development
- **Tailwind CSS v4** for responsive, modern styling
- **Radix UI** for accessible, unstyled components
- **Lucide React** for beautiful, consistent icons

### **Backend & Database**

- **Supabase** as Backend-as-a-Service
- **PostgreSQL** for robust data management
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates
- **Supabase Storage** for image and file management

### **AI & External Services**

- **Google Gemini AI** powering the chatbot assistant
- **Google Maps Platform** for mapping and location services
- **@vis.gl/react-google-maps** for React map integration

### **Authentication & Security**

- **Supabase Auth** for user management
- **Role-based access control** (user, business_owner, admin)
- **Server-side API protection** with middleware
- **Secure environment variable management**

---

## 🔐 **ROLE-BASED ACCESS CONTROL**

### **User Roles**

1. **Regular User/Tourist** (`role: 'user'`)
   - Access to discovery, planning, and review features
   - Create and manage personal itineraries
   - Submit reviews and ratings

2. **Business Owner** (`role: 'business_owner'`)
   - Full business admin panel access
   - Manage owned spots and reviews
   - Access to business analytics
   - Cannot access LGU admin features

3. **LGU Admin** (`role: 'admin'`)
   - Complete platform administration
   - User and business management
   - System settings and configuration
   - Full access to all platform features

### **Security Implementation**

- **API Route Protection**: All admin endpoints require proper authentication
- **Database-level Security**: RLS policies enforce access controls
- **Client-side Guards**: UI components respect user permissions
- **Session Management**: Secure token handling and validation

---

## 📱 **RESPONSIVE DESIGN & ACCESSIBILITY**

### **Mobile-First Approach**

- **Progressive Web App** capabilities
- **Touch-optimized interfaces** for mobile devices
- **Responsive breakpoints** for tablets and desktops
- **Bottom navigation tabs** for mobile convenience

### **Accessibility Features**

- **ARIA labels** and semantic HTML
- **Keyboard navigation** support
- **Screen reader compatibility**
- **High contrast** design elements

---

## 🚀 **DEPLOYMENT & SCALABILITY**

### **Production Ready**

- **Vercel deployment** optimized for Next.js
- **Environment-based configuration** for different stages
- **Performance optimization** with Next.js built-in features
- **SEO optimization** with proper meta tags and structured data

### **Scalability Features**

- **Database indexing** for optimal query performance
- **Image optimization** with Next.js Image component
- **API rate limiting** and caching strategies
- **CDN integration** for global content delivery

---

## 🎯 **KEY DIFFERENTIATORS**

✅ **Three-sided platform** serving tourists, government, and businesses
✅ **AI-powered assistance** with contextual tourism advice  
✅ **Real-time data** with live updates and notifications
✅ **Comprehensive role management** with secure access controls
✅ **Mobile-first design** optimized for on-the-go travelers
✅ **Integrated mapping** with Google Maps Platform
✅ **Advanced trip planning** with drag-and-drop interfaces
✅ **Business intelligence** with detailed analytics dashboards

---

## 📞 **GETTING STARTED**

1. **Clone the repository** and install dependencies
2. **Set up environment variables** for Supabase, Google Maps, and Gemini AI
3. **Configure database** with provided migration scripts
4. **Deploy to Vercel** or your preferred hosting platform
5. **Configure admin users** and start managing your tourism platform

---

**Buena Viyahe** - Where Technology Meets Tourism Excellence! 🌴✨

_Built for the modern traveler, designed for efficient management, powered by cutting-edge technology._
