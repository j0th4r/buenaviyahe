'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

// Simple email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setEmail(value)
    if (emailError) {
      validateEmail(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate email
    if (!validateEmail(email)) {
      return
    }

    // Validate password
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.')
        } else if (error.message.includes('Email not confirmed')) {
          setError(
            'Please check your email and confirm your account.'
          )
        } else if (
          error.message.includes('User already registered')
        ) {
          setError(
            'An account with this email already exists. Please sign in instead.'
          )
        } else if (error.message.includes('Database error')) {
          setError(
            'Server error. Please try again later or contact support.'
          )
        } else {
          setError(error.message)
        }
      } else {
        // Redirect to profile page after successful auth
        router.push('/profile')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Section with Background and Logo */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {/* Background pattern/overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400 rounded-full blur-xl"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-teal-400 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-400 rounded-full blur-xl"></div>
        </div>

        {/* Logo Section */}
        <div className="relative z-10 text-center">
          <Image
            src={require('@/public/logo.png')}
            alt="Buena Viyahe Logo"
            width={300}
            height={161}
            className="mx-auto"
            priority
          />
        </div>
      </div>

      {/* Bottom Section with Yellow Form Panel */}
      <div className="bg-yellow-400 rounded-t-3xl p-8">
        <div className="max-w-md mx-auto">
          {/* Welcome Text */}
          <h1 className="text-2xl font-bold text-white text-center mb-8">
            Welcome back!
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Field */}
            <div className="relative flex flex-col">
              <div className="relative">
                <div className="pointer-events-none absolute left-4 inset-y-0 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  required
                  className={`w-full rounded-lg border-0 px-12 py-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    emailError ? 'bg-red-50' : 'bg-white'
                  }`}
                  placeholder="Email"
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border-0 px-12 py-4 pr-12 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || !!emailError}
              className="w-full rounded-lg bg-white py-4 text-lg font-semibold text-orange-500 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Sign in'}
            </button>
          </form>

          {/* Or Separator */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-4 text-sm text-gray-600">Or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Login Icons */}
          <div className="flex justify-center space-x-6 mb-6">
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </button>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-gray-600 text-center">
            Don't have an account?{' '}
            <Link href={'/auth/register'}>Sign Up</Link>
          </p>

          {/* Sign Up Link */}
          {/* <div className="text-center">
            <p className="text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                  setEmailError("")
                }}
                className="ml-1 font-semibold text-gray-700 hover:text-gray-900"
              >
                {isSignUp ? "Sign in" : "Sign Up"}
              </button>
            </p>
          </div> */}

          {/* Demo credentials */}
          {/* <div className="mt-6 rounded-lg bg-white/50 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Demo Account</h3>
            <p className="text-sm text-gray-600 mb-2">
              Use these credentials to test the app:
            </p>
            <div className="text-sm text-gray-600">
              <p><strong>Email:</strong> demo@example.com</p>
              <p><strong>Password:</strong> demo123456</p>
            </div>
            <button
              onClick={() => {
                setEmail("demo@example.com")
                setPassword("demo123456")
                setEmailError("")
                setError("")
              }}
              className="mt-2 text-xs bg-white text-gray-700 px-2 py-1 rounded hover:bg-gray-50"
            >
              Fill Demo Credentials
            </button>
          </div> */}
        </div>
      </div>
    </div>
  )
}
