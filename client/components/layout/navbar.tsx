"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Home, Search, User, Users, Video, X } from "lucide-react"

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    // In a real app, you would handle logout here
    setShowDropdown(false)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-900 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/home" className="flex items-center">
            <h1 className="text-2xl font-bold text-white">GoKu</h1>
          </Link>
          {!searchOpen && (
            <div className="hidden md:flex">
              <Link href="/home" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium hover:bg-gray-800">
                <Home className="h-5 w-5" />
              </Link>
              <Link href="/videos" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium hover:bg-gray-800">
                <Video className="h-5 w-5" />
              </Link>
              <Link href="/friends" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium hover:bg-gray-800">
                <Users className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>

        <div className={`flex-1 ${searchOpen ? "mx-4" : "hidden md:block md:max-w-xs md:px-4"}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search on GoKu"
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 pl-10 text-sm text-white placeholder-gray-400 focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            {searchOpen && (
              <button
                className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md hover:bg-gray-700"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!searchOpen && (
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium hover:bg-gray-800 md:hidden"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
          )}
          <Link
            href="/notifications"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium hover:bg-gray-800"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-800"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <img src="/placeholder-user.jpg" alt="User" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">U</div>
              </div>
            </button>
            {showDropdown && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                <div className="px-4 py-2 text-sm font-medium text-white">My Account</div>
                <div className="h-px bg-gray-800" />
                <Link
                  href="/profile"
                  className="flex cursor-pointer items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                  onClick={() => setShowDropdown(false)}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex cursor-pointer items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                  onClick={() => setShowDropdown(false)}
                >
                  <span>Settings</span>
                </Link>
                <div className="h-px bg-gray-800" />
                <button
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

