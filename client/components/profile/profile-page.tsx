"use client"

import { Avatar } from "../../components/ui/avatar"
import { useState } from "react"

export default function ProfilePage() {
  const [avatar, setAvatar] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center space-y-4">
        <Avatar 
          src={avatar}
          alt="Profile"
          className="w-32 h-32"
        />
        {/* Rest of profile content */}
      </div>
    </div>
  )
}