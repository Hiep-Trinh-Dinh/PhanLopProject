"use client"

import { useState } from "react"
import PostFeed from "@/components/home/post-feed"
import ProfileAbout from "@/components/profile/profile-about"
import ProfileFriends from "@/components/profile/profile-friends"
import ProfilePhotos from "@/components/profile/profile-photos"

interface ProfileTabsProps {
  user: {
    id: number
    name: string
    username: string
  }
}

export default function ProfileTabs({ user }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("posts")

  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "about", label: "About" },
    { id: "friends", label: "Friends" },
    { id: "photos", label: "Photos" },
  ]

  return (
    <div className="w-full">
      <div className="border-b border-gray-800">
        <div className="grid grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center px-4 py-2.5 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "posts" && <PostFeed />}
        {activeTab === "about" && <ProfileAbout userId={user.id} />}
        {activeTab === "friends" && <ProfileFriends userId={user.id} />}
        {activeTab === "photos" && <ProfilePhotos userId={user.id} />}
      </div>
    </div>
  )
}

