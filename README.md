# Buena Viyahe 🏝️

A modern travel planning application for exploring Buenavista, built with Next.js 15, TypeScript, and Supabase.

## 🌟 Features

### Core Functionality

- **Spot Discovery**: Browse and search tourist spots in Buenavista
- **Trip Planning**: Create and manage personalized itineraries
- **Interactive Maps**: Visualize locations with Google Maps integration
- **User Authentication**: Secure login/registration with Supabase Auth
- **Responsive Design**: Mobile-first design with desktop optimization

### Key Features

- **Real-time Search**: Instant search results with debounced queries
- **Category Filtering**: Browse spots by categories (beaches, restaurants, etc.)
- **Itinerary Builder**: Plan trips with day-by-day organization
- **Profile Management**: User profiles with editable information
- **Review System**: Rate and review tourist spots
- **Image Management**: Upload and manage spot images via Supabase Storage

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### Backend & Database

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - File storage
  - Authentication

### Maps & External Services

- **Google Maps API** - Interactive maps and location services
- **@vis.gl/react-google-maps** - React wrapper for Google Maps

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
buenaviyahe/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── categories/        # Category browsing
│   ├── planner/          # Trip planning interface
│   ├── plans/            # Saved itineraries
│   ├── profile/          # User profile management
│   └── spots/            # Tourist spot details
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui components
│   └── auth-provider.tsx # Authentication context
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── api/            # API client functions
│   ├── supabase/       # Supabase configuration
│   └── utils/          # Helper functions
├── public/             # Static assets
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Maps API key
- Google Gemini API key

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd buenaviyahe
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Google Maps API
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Gemini AI API (for chatbot)
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up API Keys**
   - **Supabase**: Create a new Supabase project and get your URL and keys
   - **Google Maps**: Get an API key from Google Cloud Console
   - **Gemini AI**: Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

5. **Set up Supabase Database**
   - Create a new Supabase project
   - Run the database migrations (see Database Schema section)
   - Configure Row Level Security policies
   - Set up storage buckets for images

6. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### Core Tables

#### `spots`

Tourist spots and attractions

- `id` - Unique identifier
- `title` - Spot name
- `slug` - URL-friendly identifier
- `location` - Address/area
- `description` - Detailed description
- `tags` - Array of tags
- `images` - Array of image URLs
- `rating` - Average rating
- `reviews` - Number of reviews
- `pricing` - Pricing information (JSON)
- `amenities` - Available amenities
- `lat/lng` - Geographic coordinates

#### `itineraries`

User-created trip plans

- `id` - Unique identifier
- `title` - Trip name
- `image` - Cover image
- `start_date/end_date` - Trip duration
- `days` - Day-by-day itinerary (JSON)
- `user_id` - Owner reference

#### `categories`

Spot categorization

- `id` - Unique identifier
- `name` - Category name
- `description` - Category description
- `image` - Category image

#### `profiles`

User profile information

- `id` - User ID (links to auth.users)
- `username` - Display name
- `avatar_url` - Profile picture
- `bio` - User bio

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🎨 UI Components

The project uses a comprehensive set of UI components built with Radix UI primitives and styled with Tailwind CSS:

- **Navigation**: Bottom tabs, breadcrumbs, navigation menus
- **Forms**: Inputs, selects, checkboxes, radio groups
- **Feedback**: Toasts, alerts, progress indicators
- **Layout**: Cards, sheets, dialogs, accordions
- **Data Display**: Tables, charts, calendars

## 🔐 Authentication

Authentication is handled by Supabase Auth with the following features:

- Email/password registration and login
- Session management
- Protected routes
- User profile management

## 🗺️ Maps Integration

Google Maps integration provides:

- Interactive map views
- Location markers for spots
- Route visualization
- Geographic search capabilities

## 📱 Responsive Design

The application is built with a mobile-first approach:

- Optimized for mobile devices
- Responsive layouts for tablets and desktops
- Touch-friendly interactions
- Progressive Web App capabilities

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Radix UI](https://www.radix-ui.com) for accessible components
- [Google Maps Platform](https://developers.google.com/maps) for mapping services

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the Supabase documentation for backend questions

---

**Buena Viyahe** - Making travel planning in Buenavista beautiful and effortless! 🌴✨
