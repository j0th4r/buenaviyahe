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

async function resetUserPassword() {
  try {
    console.log('🔧 Resetting user password...\n')

    // Replace with your actual user's email
    const userEmail = 'your-user-email@example.com'
    const newPassword = 'your-new-password'

    const { error } = await supabase.auth.admin.updateUserById(
      'your-user-id', // Replace with actual user ID
      { password: newPassword }
    )

    if (error) {
      console.error('❌ Error resetting password:', error.message)
      return
    }

    console.log('✅ Password reset successfully!')
    console.log(`Email: ${userEmail}`)
    console.log(`Password: ${newPassword}`)

  } catch (error) {
    console.error('❌ Reset failed:', error)
  }
}

resetUserPassword()
