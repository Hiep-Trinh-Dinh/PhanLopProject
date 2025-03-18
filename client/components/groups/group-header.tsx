"use client"

import { useState } from "react"
import Image from "next/image"
import { Bell, BellOff, MoreHorizontal, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GroupHeaderProps {
  group: {
    id: number
    name: string
    cover: string
    avatar: string
    members: number
    isJoined: boolean
    isAdmin: boolean
    privacy: string
    description: string
    created: string
  }
}

export default function GroupHeader({ group }: GroupHeaderProps) {
  const [isJoined, setIsJoined] = useState(group.isJoined)
  const [isNotified, setIsNotified] = useState(true)

  const toggleJoin = () => {
    setIsJoined(!isJoined)
    // In a real app, you would handle joining/leaving the group here
  }

  const toggleNotifications = () => {
    setIsNotified(!isNotified)
    // In a real app, you would handle notification settings here
  }

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
      <div className="relative h-48 w-full sm:h-64 md:h-80">
        <Image src={group.cover || "/placeholder.svg"} alt={group.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="relative -mt-16 px-4 pb-4 sm:px-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center sm:flex-row sm:items-end">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-gray-900 bg-gray-800">
              <Image src={group.avatar || "/placeholder.svg"} alt={group.name} fill className="object-cover" />
            </div>
            <div className="mt-4 text-center sm:ml-4 sm:text-left">
              <h1 className="text-2xl font-bold text-white">{group.name}</h1>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 text-sm text-gray-400 sm:justify-start">
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>{group.members.toLocaleString()} members</span>
                </div>
                <span>•</span>
                <span>{group.privacy} Group</span>
                <span>•</span>
                <span>Created {group.created}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex space-x-2 sm:mt-0">
            <Button
              variant={isJoined ? "outline" : "default"}
              className={
                isJoined ? "border-gray-700 hover:bg-gray-800 hover:text-white" : "bg-blue-600 hover:bg-blue-700"
              }
              onClick={toggleJoin}
            >
              {isJoined ? "Joined" : "Join Group"}
            </Button>

            {isJoined && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-700 hover:bg-gray-800 hover:text-white"
                  onClick={toggleNotifications}
                >
                  {isNotified ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-gray-700 hover:bg-gray-800 hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-gray-800 bg-gray-900 text-white">
                    <DropdownMenuItem className="cursor-pointer">Invite Friends</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">Share Group</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem className="cursor-pointer text-red-400">Report Group</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-300">{group.description}</p>
        </div>
      </div>
    </div>
  )
}

