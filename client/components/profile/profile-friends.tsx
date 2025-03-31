"use client"

import Link from "next/link"
import { MoreHorizontal, Users } from "lucide-react"
import { useState } from "react"
import { Avatar } from "../../components/ui/avatar"

interface Friend {
  id: number
  name: string
  username: string
  avatar: string
  mutualFriends: number
}

interface ProfileFriendsProps {
  userId: number
}

export default function ProfileFriends({ userId }: ProfileFriendsProps) {
  const [showDropdown, setShowDropdown] = useState<number | null>(null)

  // In a real app, you would fetch this data from an API
  const friends: Friend[] = [
    {
      id: 1,
      name: "Alex Johnson",
      username: "alexjohnson",
      avatar: "/placeholder-user.jpg",
      mutualFriends: 15,
    },
    {
      id: 2,
      name: "Sarah Wilson",
      username: "sarahwilson",
      avatar: "/placeholder-user.jpg",
      mutualFriends: 8,
    },
    {
      id: 3,
      name: "Michael Brown",
      username: "michaelbrown",
      avatar: "/placeholder-user.jpg",
      mutualFriends: 12,
    },
    {
      id: 4,
      name: "Emily Davis",
      username: "emilydavis",
      avatar: "/placeholder-user.jpg",
      mutualFriends: 5,
    },
    {
      id: 5,
      name: "David Miller",
      username: "davidmiller",
      avatar: "/placeholder-user.jpg",
      mutualFriends: 20,
    },
    {
      id: 6,
      name: "Jessica Taylor",
      username: "jessicataylor",
      avatar: "/placeholder-user.jpg",
      mutualFriends: 10,
    },
  ]

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Friends</h2>
          <p className="text-sm text-gray-400">{friends.length} friends</p>
        </div>
        <Link
          href={`/profile/${userId}/friends`}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          See all friends
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
        {friends.map((friend) => (
          <div key={friend.id} className="relative">
            <div className="group rounded-lg border border-gray-800 p-3 hover:bg-gray-800">
              <div className="relative mb-2 aspect-square overflow-hidden rounded-lg">
                <Avatar 
                  src={friend.avatar}
                  alt={friend.name}
                  className="h-full w-full"
                />
              </div>
              <div>
                <Link
                  href={`/profile/${friend.username}`}
                  className="block font-medium text-white hover:underline"
                >
                  {friend.name}
                </Link>
                <div className="mt-1 flex items-center text-xs text-gray-400">
                  <Users className="mr-1 h-3 w-3" />
                  <span>{friend.mutualFriends} mutual friends</span>
                </div>
              </div>
              <button
                onClick={() => setShowDropdown(showDropdown === friend.id ? null : friend.id)}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900/50 opacity-0 hover:bg-gray-800 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showDropdown === friend.id && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                  <Link
                    href={`/profile/${friend.username}`}
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                    onClick={() => setShowDropdown(null)}
                  >
                    View Profile
                  </Link>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800"
                    onClick={() => setShowDropdown(null)}
                  >
                    Message
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800"
                    onClick={() => setShowDropdown(null)}
                  >
                    Unfriend
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

