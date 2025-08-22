'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/config"

// Simple email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const Register = () => {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [emailError, setEmailError] = useState("")

    const validateEmail = (email: string) => {
        if (!email) {
            setEmailError("Email is required")
            return false
        }
        if (!isValidEmail(email)) {
            setEmailError("Please enter a valid email address")
            return false
        }
        setEmailError("")
        return true
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setEmail(value)
        if (emailError) {
            validateEmail(value)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        
        // Validate email
        if (!validateEmail(email)) {
            return
        }

        // Validate username
        if (!username || username.length < 3) {
            setError("Username must be at least 3 characters long")
            return
        }

        // Validate password
        if (!password || password.length < 6) {
            setError("Password must be at least 6 characters long")
            return
        }

        // Check password confirmation
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            // Sign up with Supabase
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                        display_name: username,
                        full_name: username,
                        name: username
                    }
                }
            })

            if (signUpError) {
                // Handle specific Supabase errors
                if (signUpError.message.includes("User already registered")) {
                    setError("An account with this email already exists. Please sign in instead.")
                } else if (signUpError.message.includes("Password should be")) {
                    setError("Password is too weak. Please choose a stronger password.")
                } else {
                    setError(signUpError.message)
                }
                return
            }

            // If email confirmation is enabled and no session was created
            if (data.user && !data.session) {
                router.push("/check-email")
                return
            }

            // If user was created and logged in immediately
            if (data.user && data.session) {
                // Create user profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        name: username,
                        city: '',
                        about: '',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })

                if (profileError) {
                    console.error("Profile creation error:", profileError)
                    // Don't show error to user as auth was successful
                }

                // Redirect to profile page
                router.push("/profile")
            }

        } catch (err) {
            console.error("Registration error:", err)
            setError("An unexpected error occurred. Please try again.")
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
                        src={require("@/public/logo.png")}
                        alt="Buena Viyahe Logo"
                        width={300}
                        height={161}
                        className="mx-auto"
                        priority
                    />
                </div>
            </div>

            {/* Bottom Section with Yellow Form Panel */}
            <div className="bg-teal-500 rounded-t-3xl p-8">
                <div className="max-w-md mx-auto">
                    {/* Welcome Text */}
                    <h1 className="text-2xl font-bold text-white text-center mb-8">
                        Create your account!
                    </h1>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div className="relative">
                            <div className="pointer-events-none absolute left-4 inset-y-0 flex items-center">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                minLength={3}
                                className="w-full rounded-lg border-0 px-12 py-4 text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-800"
                                placeholder="Username"
                            />
                        </div>

                        {/* Email Field */}
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
                                    className={`w-full rounded-lg border-0 px-12 py-4 text-base focus:outline-none focus:ring-2 focus:ring-teal-800 ${
                                        emailError ? "bg-red-50" : "bg-white"
                                    }`}
                                    placeholder="Email"
                                />
                            </div>
                            {emailError && (
                                <p className="mt-1 text-sm text-red-600">{emailError}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={isPasswordVisible ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full rounded-lg border-0 px-12 py-4 pr-12 text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-800"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={isConfirmPasswordVisible ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full rounded-lg border-0 px-12 py-4 pr-12 text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-800"
                                    placeholder="Confirm Password"
                                />
                            <button
                                    type="button"
                                onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {isConfirmPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                            </div>

                        {/* Register Button */}
                        <button
                                type="submit" 
                            disabled={isLoading || !!emailError}
                            className="w-full rounded-lg bg-white py-4 text-lg font-semibold text-teal-800 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="text-gray-600 text-center mt-6">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-semibold text-gray-700 hover:text-gray-900">
                            Sign In
                        </Link>
                    </p>
                </div>
                </div>
            </div>
    )
}

export default Register