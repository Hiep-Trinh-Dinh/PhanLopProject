"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Check, X } from "lucide-react"

const mockFriendRequests = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/placeholder-user.jpg",
    username: "alexjohnson",
    mutualFriends: 3,
  },
  {
    id: 2,
    name: "Taylor Smith",
    avatar: "/placeholder-user.jpg",
    username: "taylorsmith",
    mutualFriends: 5,
  },
]

export default function FriendRequests() {
  const [friendRequests, setFriendRequests] = useState(mockFriendRequests)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const acceptRequest = (requestId: number) => {
    setFriendRequests(friendRequests.filter((request) => request.id !== requestId))
  }

  const rejectRequest = (requestId: number) => {
    setFriendRequests(friendRequests.filter((request) => request.id !== requestId))
  }

  if (!mounted) {
    return null
  }

  if (friendRequests.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold select-none pointer-events-none">
            Friend Requests
          </h2>
        </div>
        <div className="p-4">
          <p className="text-center text-gray-400 select-none pointer-events-none">
            No friend requests at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold select-none pointer-events-none">
          Friend Requests ({friendRequests.length})
        </h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {friendRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src={request.avatar}
                    alt={request.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                    {request.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <Link
                    href={`/profile/${request.username}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {request.name}
                  </Link>
                  <p className="text-xs text-gray-400 select-none pointer-events-none">
                    {request.mutualFriends} mutual friends
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className="inline-flex h-8 items-center justify-center rounded-md bg-blue-600 px-2 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={() => acceptRequest(request.id)}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex h-8 items-center justify-center rounded-md border border-gray-700 px-2 text-sm font-medium hover:bg-gray-700 hover:text-white"
                  onClick={() => rejectRequest(request.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

