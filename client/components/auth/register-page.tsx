"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/home")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">GoKu</h1>
          <p className="mt-2 text-gray-400">Create a new account</p>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900">
          <div className="p-6">
            <h2 className="text-xl text-white">Sign Up</h2>
            <p className="text-sm text-gray-400">Fill in your details to create an account</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-200">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    placeholder="First name"
                    required
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-200">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    placeholder="Last name"
                    required
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-200">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    required
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="day" className="text-sm font-medium text-gray-200">
                    Day
                  </label>
                  <select 
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="month" className="text-sm font-medium text-gray-200">
                    Month
                  </label>
                  <select 
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Month</option>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                      (month, i) => (
                        <option key={i} value={i + 1}>
                          {month}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="year" className="text-sm font-medium text-gray-200">
                    Year
                  </label>
                  <select 
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 100 }, (_, i) => (
                      <option key={i} value={new Date().getFullYear() - i}>
                        {new Date().getFullYear() - i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Gender</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-2">
                    <input type="radio" id="male" name="gender" value="male" className="h-4 w-4" />
                    <label htmlFor="male" className="text-sm text-gray-300">
                      Male
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-2">
                    <input type="radio" id="female" name="gender" value="female" className="h-4 w-4" />
                    <label htmlFor="female" className="text-sm text-gray-300">
                      Female
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-2">
                    <input type="radio" id="custom" name="gender" value="custom" className="h-4 w-4" />
                    <label htmlFor="custom" className="text-sm text-gray-300">
                      Custom
                    </label>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                By clicking Sign Up, you agree to our{" "}
                <Link href="/terms" className="text-blue-400 hover:underline">
                  Terms
                </Link>
                ,{" "}
                <Link href="/privacy-policy" className="text-blue-400 hover:underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/cookies-policy" className="text-blue-400 hover:underline">
                  Cookies Policy
                </Link>
                .
              </div>

              <button 
                type="submit" 
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Sign Up
              </button>
            </form>
          </div>

          <div className="border-t border-gray-800 bg-gray-900 p-6">
            <div className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/" className="text-blue-400 hover:underline">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

