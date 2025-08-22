'use server'

import { createServerClient } from "../supabase/config"
import { redirect } from "next/navigation"

const RegisterUser = async (formData: FormData) => {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        username: formData.get('username') as string
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // 👇 If email confirmation is enabled
  if (data.user && !data.session) {
    redirect('/check-email')  // ✅ route where you tell them to confirm
  }
}

export { RegisterUser }
