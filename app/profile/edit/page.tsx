'use client'

import Link from 'next/link'
import { ArrowLeft, Camera, Search } from 'lucide-react'
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  updateProfileWithAvatar,
} from '@/lib/api/profile'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function EditProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [website, setWebsite] = useState('')
  const [about, setAbout] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>(
    '/placeholder-user.jpg'
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Hydration guard to ensure we sync any changes made elsewhere
  useEffect(() => {
    getProfile()
      .then((fresh) => {
        setName(fresh.name)
        setCity(fresh.city)
        setWebsite(fresh.website || '')
        setAbout(fresh.about || '')
        setAvatarUrl(fresh.avatarUrl || '/placeholder-user.jpg')
      })
      .catch(() => {})
  }, [])

  const handleAvatarChange = async (file: File) => {
    try {
      setIsUploading(true)

      // Update profile with new avatar
      const updatedProfile = await updateProfileWithAvatar(
        { name, city, website, about, avatarUrl },
        file
      )
      setName(updatedProfile.name)
      setCity(updatedProfile.city)
      setWebsite(updatedProfile.website || '')
      setAbout(updatedProfile.about || '')
      setAvatarUrl(
        updatedProfile.avatarUrl || '/placeholder-user.jpg'
      )

      // Show success message
      toast({
        title: 'Success',
        description: 'Avatar updated successfully!',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload avatar',
        variant: 'destructive',
      })
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[430px] px-5 pb-10 pt-6">
        <header className="flex items-center justify-between py-2">
          <Link
            aria-label="Go back"
            href="/profile"
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">
            Edit profile
          </h1>
          <div className="w-6" />
        </header>

        <div className="mt-8 flex flex-col items-center">
          <div className="relative">
            <img
              src={
                avatarFile
                  ? URL.createObjectURL(avatarFile)
                  : avatarUrl
              }
              alt="Profile picture"
              className="h-28 w-28 rounded-full object-cover"
            />
            <label
              className="absolute bottom-1 right-1 rounded-full bg-white p-1.5 shadow-md cursor-pointer"
              aria-label="Change photo"
            >
              <Camera className="h-4 w-4 text-gray-700" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null
                  if (f) {
                    setAvatarFile(f)
                    handleAvatarChange(f)
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label
              htmlFor="current-city"
              className="text-sm font-medium text-gray-700"
            >
              Current city
            </label>
            <div className="relative mt-1">
              <input
                id="current-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <div>
            <label
              htmlFor="website"
              className="text-sm font-medium text-gray-700"
            >
              Website
            </label>
            <input
              id="website"
              type="text"
              placeholder="Add a website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label
              htmlFor="about"
              className="text-sm font-medium text-gray-700"
            >
              About you
            </label>
            <textarea
              id="about"
              rows={4}
              placeholder="Write some details about yourself"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="mt-10">
          {error && (
            <p className="mb-3 text-sm text-red-600">{error}</p>
          )}
          <button
            disabled={saving || !name.trim() || !city.trim()}
            className="w-full rounded-lg bg-teal-500 py-3 font-semibold text-white shadow-md hover:bg-teal-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            onClick={async () => {
              setSaving(true)
              try {
                setError(null)
                // Just update the profile with current avatarUrl (already uploaded)
                await updateProfile({
                  name,
                  city,
                  website,
                  about,
                  avatarUrl,
                })
                router.replace('/profile')
              } catch (e: any) {
                setError(
                  e?.message ||
                    'Failed to save profile. Please try again.'
                )
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </main>
    </div>
  )
}
