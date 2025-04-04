"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordClient() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      document.getElementById("email")?.setAttribute("autocomplete", "off")
    }, 100)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-6xl font-bold text-white select-none pointer-events-none">
            GoKu
          </h1>
          <p className="mt-2 text-gray-400 select-none pointer-events-none">
            Connect with friends and the world around you
          </p>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900">
          <div className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={24} />
              </Link>
              <h2 className="text-center text-3xl text-white select-none pointer-events-none">
                Forgot Password
              </h2>
            </div>
            <p className="text-center text-lg text-gray-400 mt-2 select-none pointer-events-none">
              Enter your email to reset your password
            </p>
          </div>

          <div className="p-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative w-full">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => e.target.removeAttribute("readonly")}
                    required
                    readOnly
                    className="peer w-full bg-transparent border-b border-gray-500 rounded-md text-white px-2 pb-1 pt-5 focus:outline-none focus:border-blue-500"
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-2 ${
                      email
                        ? "top-0 text-blue-500 text-sm"
                        : "top-5 text-gray-400 text-sm"
                    } transition-all peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-sm select-none pointer-events-none`}
                  >
                    Email
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  We've sent password reset instructions to your email.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Back to Login
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 bg-gray-900 p-6">
            <div className="text-center text-sm text-gray-400">
              <p className="text-lg select-none">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-lg text-blue-400 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 