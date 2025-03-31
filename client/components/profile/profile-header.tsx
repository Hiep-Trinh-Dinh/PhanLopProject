"use client"

import { useState } from "react"
import Link from "next/link"
import { Camera, MessageCircle, MoreHorizontal, UserPlus, Users } from "lucide-react"
import { Avatar } from "../../components/ui/avatar"

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
    <div className="space-y-4">
      {/* Cover Image */}
      <div className="relative h-32 w-full overflow-hidden sm:h-48 md:h-64">
        <Avatar 
          src={user.coverImage}
          alt="Cover image"
          className="h-full w-full rounded-none"
        />
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6">
        <div className="relative -mt-16 flex items-end space-x-4">
          <Avatar 
            src={user.avatar}
            alt={user.name}
            className="h-24 w-24 border-4 border-background sm:h-32 sm:w-32"
          />
          <div className="pb-4">
            <h1 className="text-xl font-bold sm:text-2xl">{user.name}</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {user.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

