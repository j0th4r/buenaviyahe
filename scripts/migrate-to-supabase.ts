import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'
import dbData from '../api/database/db.json'

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateData() {
  try {
    console.log('Starting migration...')
    
    // Migrate spots
    console.log('\nMigrating spots...')
    for (const spot of dbData.spots) {
      const { error } = await supabase
        .from('spots')
        .insert({
          id: spot.id,
          title: spot.title,
          slug: spot.slug,
          location: spot.location,
          description: spot.description,
          tags: spot.tags,
          images: spot.images,
          rating: spot.rating,
          reviews: spot.reviews,
          pricing: spot.pricing,
          amenities: spot.amenities,
          lat: spot.lat,
          lng: spot.lng,
          created_at: spot.createdAt,
          updated_at: spot.updatedAt,
        })
      
      if (error) {
        console.error(`❌ Error migrating spot ${spot.id}:`, error.message)
      } else {
        console.log(`✅ Migrated spot: ${spot.title}`)
      }
    }

    // Migrate categories
    console.log('\nMigrating categories...')
    for (const category of dbData.categories) {
      const { error } = await supabase
        .from('categories')
        .insert({
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          price_range: category.priceRange,
        })
      
      if (error) {
        console.error(`❌ Error migrating category ${category.id}:`, error.message)
      } else {
        console.log(`✅ Migrated category: ${category.name}`)
      }
    }

    // Migrate reviews
    console.log('\nMigrating reviews...')
    for (const review of dbData.reviews) {
      const { error } = await supabase
        .from('reviews')
        .insert({
          spot_id: review.spotId,
          user_name: review.userName,
          user_avatar: review.userAvatar,
          rating: review.rating,
          comment: review.comment,
          created_at: review.date,
        })
      
      if (error) {
        console.error(`❌ Error migrating review ${review.id}:`, error.message)
      } else {
        console.log(`✅ Migrated review for spot: ${review.spotId}`)
      }
    }

    console.log('\n🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateData()
