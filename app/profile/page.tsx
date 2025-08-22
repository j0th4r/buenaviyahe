"use client"

import Link from "next/link"
import { ArrowLeft, Pencil, MapPin, Link as LinkIcon, Lock, LogOut } from "lucide-react"
import { BottomTabs } from "@/components/ui/bottom-tabs"
import { useEffect, useState, Suspense } from "react"
import { getProfile as apiGetProfile } from "@/lib/api/profile"
import type { UserProfile } from "@/lib/api/profile"
import { useAuth } from "@/hooks/use-auth"

// Loading skeleton component with animate-pulse
function ProfileLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
        {/* Header skeleton */}
        <header className="flex items-center justify-between py-2">
          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
        </header>

        <section className="mt-6">
          {/* Profile header skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* About section skeleton */}
          <div className="mt-8 space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Contact info skeleton */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Achievements section skeleton */}
          <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm border">
            <div className="mb-6 flex items-center justify-between">
              <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sign out button skeleton */}
          <div className="mt-8">
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </section>
      </main>

      <BottomTabs />
    </div>
  )
}

// Profile content component that will be wrapped in Suspense
function ProfileContent() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setIsLoading(true)
      // Fetch from API
      apiGetProfile()
        .then(setProfile)
        .catch(() => {})
        .finally(() => setIsLoading(false))
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to home page after sign out
      window.location.href = "/"
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-[430px] px-5 py-8">
          <header className="flex items-center justify-between py-2">
            <Link aria-label="Go back" href="/" className="rounded-full p-1 hover:bg-gray-100">
              <ArrowLeft className="h-6 w-6 text-gray-800" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Profile</h1>
            <div className="w-6" />
          </header>

          <div className="mt-8 rounded-xl border border-dashed p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Sign in required</h2>
            <p className="text-gray-600 mb-4">Please sign in to view your profile</p>
            <Link 
              href="/auth/login" 
              className="inline-block rounded-full bg-teal-400 px-6 py-3 text-white font-semibold hover:bg-teal-500"
            >
              Sign In
            </Link>
          </div>
        </div>
        <BottomTabs />
      </div>
    )
  }

  // Show loading skeleton while fetching profile data
  if (isLoading || !profile) {
    return <ProfileLoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[430px] px-5 pb-28 pt-8 lg:max-w-7xl lg:px-8 xl:px-10">
        <header className="flex items-center justify-between py-2">
          <Link aria-label="Go back" href="/" className="rounded-full p-1 hover:bg-gray-100">
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Profile</h1>
          <Link aria-label="Edit profile" href="/profile/edit" className="rounded-full p-1 hover:bg-gray-100">
            <Pencil className="h-6 w-6 text-gray-800" />
          </Link>
        </header>

        <section className="mt-6">
          <div className="flex items-center gap-4">
            <img
              src={profile?.avatarUrl || "/placeholder-user.jpg"}
              alt={`Profile picture of ${profile?.name || "User"}`}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile?.name || ""}</h2>
              <p className="text-gray-500">Joined in {profile?.joinedYear || new Date().getFullYear()}</p>
              <p className="text-gray-500">{profile?.contributions || 0} contributions</p>
            </div>
          </div>

          <p className="mt-8 text-gray-600">
            {profile?.about?.trim()
              ? profile.about
              : "Share a little about yourself so other travellers can get to know you!"}
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <p className="text-gray-800">{profile?.city || ""}</p>
            </div>
            <div className="flex items-center gap-3">
              <LinkIcon className="h-5 w-5 text-gray-500" />
              <p className="text-gray-500">{profile?.website?.trim() ? profile.website : "No website added."}</p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm border">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Your Achievements</h3>
              <Link href="#" className="text-teal-600 font-semibold">View all</Link>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gray-100 p-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Write your first review</p>
                  <p className="text-gray-500">Unlock review milestones</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="mt-8">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </section>
      </main>

      <BottomTabs />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoadingSkeleton />}>
      <ProfileContent />
    </Suspense>
  )
}


