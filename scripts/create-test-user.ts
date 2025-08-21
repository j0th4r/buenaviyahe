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

async function createTestUser() {
  try {
    console.log('�� Creating test user...\n')

    const TEST_EMAIL = 'test@example.com'
    const TEST_PASSWORD = 'test123456'

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.email === TEST_EMAIL)

    if (existingUser) {
      console.log('✅ Test user already exists!')
      console.log(`📧 Email: ${TEST_EMAIL}`)
      console.log('🔑 You can reset the password manually in Supabase dashboard')
      return
    }

    // Create user with minimal data
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'Test User'
      }
    })

    if (error) {
      console.error('❌ Error creating user:', error.message)
      console.log('\n💡 Try these solutions:')
      console.log('1. Check your Supabase project settings')
      console.log('2. Verify your service role key has admin permissions')
      console.log('3. Check if email confirmation is required')
      return
    }

    console.log('✅ Test user created successfully!')
    console.log(`📧 Email: ${TEST_EMAIL}`)
    console.log(`�� Password: ${TEST_PASSWORD}`)
    console.log(`🆔 User ID: ${data.user?.id}`)

    // Try to create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: 'Test User',
          city: 'Test City',
          about: 'Test user for development',
          joined_year: new Date().getFullYear(),
          contributions: 0,
          avatar_url: '/placeholder-user.jpg'
        })

      if (profileError) {
        console.log('⚠️  User created but profile creation failed:', profileError.message)
      } else {
        console.log('✅ Profile created successfully!')
      }
    }

  } catch (error) {
    console.error('❌ Creation failed:', error)
  }
}

createTestUser()
