import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testItineraryStore() {
  try {
    console.log('🧪 Testing Itinerary Store Integration...\n')

    // Test the conversion functions
    console.log('1️⃣ Testing data conversion...')
    
    const supabaseItinerary = {
      id: 'test-uuid-123',
      title: 'Test Trip',
      location: 'Buenavista',
      image: '/test-image.jpg',
      start_date: '2024-12-01',
      end_date: '2024-12-03',
      days: {
        1: [
          {
            id: 'spot-1',
            title: 'Ocean Bloom',
            image: '/ocean-bloom.jpg',
            location: 'Manapa',
            rating: 4.8,
            time: '09:00',
            pricePerNight: 100,
            lat: 8.9801432,
            lng: 125.440978
          }
        ]
      },
      spots: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      user_id: 'demo-user-id'
    }

    // Test conversion from Supabase to app format
    const { convertFromSupabase } = await import('../lib/api/itineraries')
    const appItinerary = convertFromSupabase(supabaseItinerary as any)
    
    console.log('✅ Supabase → App conversion working')
    console.log(`   App itinerary ID: ${appItinerary.id}`)
    console.log(`   App itinerary title: ${appItinerary.title}`)
    console.log(`   App itinerary days: ${Object.keys(appItinerary.days || {}).length} days`)

    // Test conversion from app to Supabase format
    const { convertToSupabase } = await import('../lib/api/itineraries')
    const supabaseData = convertToSupabase({
      title: 'App Trip',
      location: 'Buenavista',
      start: '2024-12-01',
      end: '2024-12-03',
      days: { 1: [] }
    }, 'demo-user-id')
    
    console.log('✅ App → Supabase conversion working')
    console.log(`   Supabase title: ${supabaseData.title}`)
    console.log(`   Supabase user_id: ${supabaseData.user_id}`)

    console.log('\n🎉 Itinerary store integration tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testItineraryStore()
