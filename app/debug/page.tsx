"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/config"

export default function DebugPage() {
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("demo123456")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testSignIn = async () => {
    setLoading(true)
    setResult("Testing sign in...")
    
    try {
      console.log("Attempting sign in with:", { email, password })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Sign in result:", { data, error })

      if (error) {
        setResult(`Error: ${error.message}`)
      } else {
        setResult(`Success! User ID: ${data.user?.id}`)
      }
    } catch (err) {
      console.error("Exception:", err)
      setResult(`Exception: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setResult(`Current session: ${session ? 'Active' : 'None'}`)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setResult("Signed out")
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={testSignIn}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Test Sign In
            </button>
            <button
              onClick={checkSession}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Check Session
            </button>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Sign Out
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
