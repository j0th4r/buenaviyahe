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

async function verifyMigration() {
  try {
    console.log('🔍 Verifying migration...\n')

    // Check spots
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('*')
    
    if (spotsError) {
      console.error('❌ Error fetching spots:', spotsError.message)
    } else {
      console.log(`✅ Spots: ${spots?.length || 0} records found`)
      if (spots && spots.length > 0) {
        console.log(`   Sample: ${spots[0].title}`)
      }
    }

    // Check categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
    
    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError.message)
    } else {
      console.log(`✅ Categories: ${categories?.length || 0} records found`)
      if (categories && categories.length > 0) {
        console.log(`   Sample: ${categories[0].name}`)
      }
    }

    // Check reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
    
    if (reviewsError) {
      console.error('❌ Error fetching reviews:', reviewsError.message)
    } else {
      console.log(`✅ Reviews: ${reviews?.length || 0} records found`)
      if (reviews && reviews.length > 0) {
        console.log(`   Sample: ${reviews[0].user_name} - ${reviews[0].comment.substring(0, 50)}...`)
      }
    }

    console.log('\n🎉 Verification completed!')

  } catch (error) {
    console.error('❌ Verification failed:', error)
  }
}

verifyMigration()
