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

async function setDemoPassword() {
  try {
    console.log('🔧 Setting demo user password...\n')

    const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000'
    const DEMO_PASSWORD = 'demo123456'

    // Update the user's password
    const { error } = await supabase.auth.admin.updateUserById(
      DEMO_USER_ID,
      { password: DEMO_PASSWORD }
    )

    if (error) {
      console.error('❌ Error updating password:', error.message)
      return
    }

    console.log('✅ Demo user password updated successfully!')
    console.log(`📧 Email: demo@example.com`)
    console.log(`�� Password: ${DEMO_PASSWORD}`)
    console.log('\n🎉 You can now sign in with these credentials!')

  } catch (error) {
    console.error('❌ Password update failed:', error)
  }
}

setDemoPassword()
