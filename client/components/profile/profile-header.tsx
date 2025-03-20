"use client"

import { useState } from "react"
import Link from "next/link"
import { Camera, MessageCircle, MoreHorizontal, UserPlus, Users } from "lucide-react"

interface User {
  id: number
  name: string
  username: string
  avatar: string
  coverImage: string
  bio: string
  friendsCount: number
  mutualFriends: number
  isCurrentUser: boolean
  isFriend: boolean
}

interface ProfileHeaderProps {
  user: User
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isFriend, setIsFriend] = useState(user.isFriend)

  const handleFriendAction = () => {
    // In a real app, you would make an API call here
    setIsFriend(!isFriend)
  }

  return (
    <div className="relative rounded-lg border border-gray-800 bg-gray-900">
      <div className="relative h-48 overflow-hidden rounded-t-lg sm:h-64">
        <img src={user.coverImage} alt="Cover" className="h-full w-full object-cover" />
        {user.isCurrentUser && (
          <button className="absolute bottom-4 right-4 flex items-center space-x-2 rounded-md bg-gray-900/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-gray-800">
            <Camera className="h-4 w-4" />
            <span>Edit Cover Photo</span>
          </button>
        )}
      </div>

      <div className="relative px-4 pb-4 pt-16 sm:px-6 sm:pb-6">
        <div className="absolute -top-12 left-4 sm:left-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-gray-900 sm:h-32 sm:w-32">
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            {user.isCurrentUser && (
              <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{user.name}</h1>
            <p className="mt-1 text-sm text-gray-400">@{user.username}</p>
            {user.bio && <p className="mt-2 text-gray-300">{user.bio}</p>}
            <div className="mt-3 flex items-center space-x-4 text-sm text-gray-400">
              <Link href={`/profile/${user.username}/friends`} className="flex items-center hover:text-white">
                <Users className="mr-1.5 h-4 w-4" />
                <span>
                  {user.friendsCount} {user.friendsCount === 1 ? "Friend" : "Friends"}
                </span>
              </Link>
              {!user.isCurrentUser && user.mutualFriends > 0 && (
                <>
                  <span>•</span>
                  <span>{user.mutualFriends} mutual friends</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!user.isCurrentUser && (
              <>
                <button
                  onClick={handleFriendAction}
                  className={`flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium ${
                    isFriend
                      ? "border border-gray-700 text-white hover:bg-gray-800"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isFriend ? (
                    <>
                      <Users className="h-4 w-4" />
                      <span>Friends</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Add Friend</span>
                    </>
                  )}
                </button>
                <button className="flex items-center space-x-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                  <MessageCircle className="h-4 w-4" />
                  <span>Message</span>
                </button>
              </>
            )}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-800"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                  {user.isCurrentUser ? (
                    <>
                      <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                        Edit Profile
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                        Privacy Settings
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                        Share Profile
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800">
                        Block User
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800">
                        Report Profile
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

