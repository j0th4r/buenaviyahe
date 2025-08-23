'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

export function AuthStatus() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
    )
  }

  if (user) {
    return (
      <Link
        href="/profile"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200"
      >
        <span className="text-sm font-semibold">
          {user.email?.charAt(0).toUpperCase() || 'U'}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href="/auth"
      className="rounded-full bg-teal-400 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
    >
      Sign In
    </Link>
  )
}
