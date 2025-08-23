'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/config'

export function ConnectionTest() {
  const [status, setStatus] = useState('Testing...')
  const [error, setError] = useState('')

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)

        if (error) {
          setError(`Database error: ${error.message}`)
          setStatus('Failed')
        } else {
          setStatus('Connected')
        }
      } catch (err) {
        setError(`Connection error: ${err}`)
        setStatus('Failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold">Connection Status: {status}</h3>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  )
}
