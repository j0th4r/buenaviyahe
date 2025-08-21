import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  console.log('Please check your .env.local file has:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  try {
    console.log('🔧 Testing Supabase connection...\n')
    console.log('URL:', supabaseUrl)
    console.log('Service Key:', supabaseServiceKey ? '✅ Present' : '❌ Missing')
    console.log('')

    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return
    }

    console.log('✅ Database connection successful!')

    // Test auth connection
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Auth connection failed:', authError.message)
      return
    }

    console.log('✅ Auth connection successful!')
    console.log(`📊 Found ${authData.users.length} users in auth`)

    // List existing users
    if (authData.users.length > 0) {
      console.log('\n�� Existing users:')
      authData.users.forEach(user => {
        console.log(`- ${user.email} (${user.id})`)
      })
    }

    console.log('\n🎉 All tests passed! Your Supabase is properly configured.')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testConnection()
