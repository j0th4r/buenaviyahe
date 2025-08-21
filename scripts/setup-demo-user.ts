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

async function setupDemoUser() {
  try {
    console.log('🔧 Setting up demo user...\n')

    const DEMO_EMAIL = 'demo@example.com'
    const DEMO_PASSWORD = 'demo123456'

    // First, try to create the user through Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true, // Auto-confirm the email
    })

    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log('✅ Demo user already exists in auth')
      } else {
        console.error('❌ Error creating demo user in auth:', authError.message)
        return
      }
    } else {
      console.log('✅ Demo user created in auth successfully!')
    }

    // Get the user ID (either from creation or existing user)
    let userId: string
    if (authData?.user) {
      userId = authData.user.id
    } else {
      // Try to get existing user
      const { data: existingUser } = await supabase.auth.admin.listUsers()
      const demoUser = existingUser.users.find(u => u.email === DEMO_EMAIL)
      if (!demoUser) {
        console.error('❌ Could not find demo user')
        return
      }
      userId = demoUser.id
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      console.log('✅ Demo profile already exists')
      return
    }

    // Create demo profile
    const { error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: 'Demo User',
        city: 'Buenavista, Agusan del Norte',
        website: 'demo.com',
        about: 'I\'m a demo user exploring this travel app!',
        joined_year: new Date().getFullYear(),
        contributions: 0,
        avatar_url: '/placeholder-user.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (createProfileError) {
      console.error('❌ Error creating demo profile:', createProfileError.message)
      return
    }

    console.log('✅ Demo profile created successfully!')
    console.log('\n🎉 Demo user setup completed!')
    console.log(`\n📧 Email: ${DEMO_EMAIL}`)
    console.log(` Password: ${DEMO_PASSWORD}`)
    console.log('\nYou can now sign in with these credentials!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupDemoUser()
