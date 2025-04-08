"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { UserPlus } from "lucide-react"

const mockFriendSuggestions = [
  {
    id: 1,
    name: "Jordan Lee",
    avatar: "/placeholder-user.jpg",
    username: "jordanlee",
    mutualFriends: 7,
  },
  {
    id: 2,
    name: "Casey Morgan",
    avatar: "/placeholder-user.jpg",
    username: "caseymorgan",
    mutualFriends: 4,
  },
  {
    id: 3,
    name: "Riley Parker",
    avatar: "/placeholder-user.jpg",
    username: "rileyparker",
    mutualFriends: 2,
  },
]

export default function FriendSuggestions() {
  const [friendSuggestions, setFriendSuggestions] = useState(mockFriendSuggestions)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const addFriend = (suggestionId: number) => {
    setFriendSuggestions(friendSuggestions.filter((suggestion) => suggestion.id !== suggestionId))
  }

  if (!mounted) {
    return null // or a loading skeleton
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold select-none pointer-events-none">
          People You May Know
        </h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {friendSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src={suggestion.avatar}
                    alt={suggestion.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                    {suggestion.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <Link
                    href={`/profile/${suggestion.username}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {suggestion.name}
                  </Link>
                  <p className="text-xs text-gray-400 select-none pointer-events-none">
                    {suggestion.mutualFriends} mutual friends
                  </p>
                </div>
              </div>
              <button
                className="inline-flex h-8 items-center justify-center rounded-md border border-gray-700 px-3 text-sm font-medium hover:bg-gray-700 hover:text-white"
                onClick={() => addFriend(suggestion.id)}
              >
                <UserPlus className="mr-1 h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

