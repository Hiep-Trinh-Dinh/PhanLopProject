"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would handle registration here
    router.push("/home")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">GoKu</h1>
          <p className="mt-2 text-gray-400">Create a new account</p>
        </div>

        <Card className="border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-xl text-white">Sign Up</CardTitle>
            <CardDescription>Fill in your details to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-200">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    required
                    className="border-gray-700 bg-gray-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-200">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    required
                    className="border-gray-700 bg-gray-800 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-200">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    required
                    className="border-gray-700 bg-gray-800 pr-10 text-white"
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
                  <Select>
                    <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="month" className="text-sm font-medium text-gray-200">
                    Month
                  </label>
                  <Select>
                    <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                        (month, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {month}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="year" className="text-sm font-medium text-gray-200">
                    Year
                  </label>
                  <Select>
                    <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 100 }, (_, i) => (
                        <SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>
                          {new Date().getFullYear() - i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Sign Up
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-gray-800 bg-gray-900">
            <div className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/" className="text-blue-400 hover:underline">
                Log In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

