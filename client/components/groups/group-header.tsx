"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, BellOff, MoreHorizontal, Share, UserPlus } from "lucide-react"

interface GroupHeaderProps {
  groupId: number
}

export default function GroupHeader({ groupId }: GroupHeaderProps) {
  const [isJoined, setIsJoined] = useState(false)
  const [isNotified, setIsNotified] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const groupData = {
    name: "React Developers Community",
    coverImage: "/placeholder-cover.jpg",
    avatar: "/placeholder-group.jpg",
    privacy: "Public",
    members: 1250,
  }

  const toggleJoin = () => setIsJoined(!isJoined)
  const toggleNotification = () => setIsNotified(!isNotified)

  return (
    <div className="relative mb-6 overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
      <div className="relative h-48 w-full sm:h-64">
        <img
          src={groupData.coverImage}
          alt={groupData.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="relative -mt-16 px-4 pb-4">
        <div className="flex flex-col items-start justify-between space-y-3 sm:flex-row sm:items-end sm:space-y-0">
          <div className="flex items-end space-x-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-lg border-4 border-gray-900">
              <img
                src={groupData.avatar}
                alt={groupData.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mb-1">
              <h1 className="text-2xl font-bold text-white">{groupData.name}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{groupData.privacy} Group</span>
                <span>•</span>
                <span>{groupData.members.toLocaleString()} members</span>
              </div>
            </div>
          </div>

          <div className="flex w-full space-x-2 sm:w-auto">
            <button
              onClick={toggleJoin}
              className={`inline-flex flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-medium sm:flex-none ${
                isJoined
                  ? "border border-gray-700 hover:bg-gray-800"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isJoined ? (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Joined
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join Group
                </>
              )}
            </button>

            <button
              onClick={toggleNotification}
              className="inline-flex items-center justify-center rounded-md border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800"
            >
              {isNotified ? (
                <BellOff className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="inline-flex items-center justify-center rounded-md border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    onClick={() => {
                      console.log("Share group")
                      setShowMenu(false)
                    }}
                  >
                    <Share className="mr-2 h-4 w-4" />
                    Share Group
                  </button>
                  <Link
                    href={`/groups/${groupId}/settings`}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    onClick={() => setShowMenu(false)}
                  >
                    Group Settings
                  </Link>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                    onClick={() => {
                      console.log("Leave group")
                      setShowMenu(false)
                    }}
                  >
                    Leave Group
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

