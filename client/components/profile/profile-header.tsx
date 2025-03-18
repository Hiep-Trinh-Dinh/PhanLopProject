"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Calendar, LinkIcon, MapPin, MoreHorizontal, UserPlus, UserMinus, Mail } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProfileHeaderProps {
  user: {
    id: number
    name: string
    username: string
    avatar: string
    cover: string
    bio: string
    location?: string
    website?: string
    joinedDate: string
    following: number
    followers: number
    posts: number
  }
  isOwnProfile: boolean
}

export default function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(user.followers)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user.name,
    bio: user.bio,
    location: user.location || "",
    website: user.website || "",
  })

  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1)
  }

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send the updated profile data to the server
    console.log("Updated profile:", profileData)
    setEditProfileOpen(false)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
      <div className="relative h-48 w-full sm:h-64 md:h-80">
        <Image src={user.cover || "/placeholder.svg"} alt={`${user.name}'s cover`} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="relative -mt-16 px-4 pb-4 sm:px-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center sm:flex-row sm:items-end">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-gray-900 bg-gray-800">
              <Avatar className="h-full w-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-4 text-center sm:ml-4 sm:text-left">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-400">@{user.username}</p>
            </div>
          </div>

          <div className="mt-4 flex space-x-2 sm:mt-0">
            {isOwnProfile ? (
              <>
                <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-gray-700 hover:bg-gray-800 hover:text-white">
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-gray-800 bg-gray-900 text-white sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Make changes to your profile information.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleProfileUpdate}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="border-gray-700 bg-gray-800 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            className="min-h-[100px] border-gray-700 bg-gray-800 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            className="border-gray-700 bg-gray-800 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={profileData.website}
                            onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                            className="border-gray-700 bg-gray-800 text-white"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-700 hover:bg-gray-800 hover:text-white"
                          onClick={() => setEditProfileOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

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
                    <DropdownMenuItem className="cursor-pointer">View as Guest</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">Share Profile</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem className="cursor-pointer text-red-400">Deactivate Account</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  className={
                    isFollowing ? "border-gray-700 hover:bg-gray-800 hover:text-white" : "bg-blue-600 hover:bg-blue-700"
                  }
                  onClick={toggleFollow}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="mr-1 h-4 w-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1 h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>

                <Button variant="outline" className="border-gray-700 hover:bg-gray-800 hover:text-white">
                  <Mail className="mr-1 h-4 w-4" />
                  Message
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
                    <DropdownMenuItem className="cursor-pointer">Share Profile</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">Mute User</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem className="cursor-pointer text-red-400">Block User</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-red-400">Report User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-300">{user.bio}</p>

          <div className="mt-4 flex flex-wrap gap-y-2 text-sm text-gray-400">
            {user.location && (
              <div className="mr-4 flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{user.location}</span>
              </div>
            )}

            {user.website && (
              <div className="mr-4 flex items-center">
                <LinkIcon className="mr-1 h-4 w-4" />
                <a
                  href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {user.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            <div className="mr-4 flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              <span>{user.joinedDate}</span>
            </div>
          </div>

          <div className="mt-4 flex space-x-4 border-t border-gray-800 pt-4 text-sm">
            <div>
              <span className="font-bold text-white">{formatNumber(user.following)}</span>
              <span className="ml-1 text-gray-400">Following</span>
            </div>
            <div>
              <span className="font-bold text-white">{formatNumber(followerCount)}</span>
              <span className="ml-1 text-gray-400">Followers</span>
            </div>
            <div>
              <span className="font-bold text-white">{formatNumber(user.posts)}</span>
              <span className="ml-1 text-gray-400">Posts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

