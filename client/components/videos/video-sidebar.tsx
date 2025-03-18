"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus } from "lucide-react"

// Mock data for suggested creators
const mockCreators = [
  {
    id: 1,
    name: "Alex Johnson",
    username: "alexjohnson",
    avatar: "/placeholder-user.jpg",
    followers: 125000,
    isFollowing: false,
  },
  {
    id: 2,
    name: "Taylor Smith",
    username: "taylorsmith",
    avatar: "/placeholder-user.jpg",
    followers: 89000,
    isFollowing: false,
  },
  {
    id: 3,
    name: "Jordan Lee",
    username: "jordanlee",
    avatar: "/placeholder-user.jpg",
    followers: 210000,
    isFollowing: false,
  },
  {
    id: 4,
    name: "Casey Morgan",
    username: "caseymorgan",
    avatar: "/placeholder-user.jpg",
    followers: 67000,
    isFollowing: false,
  },
]

// Mock data for trending topics
const mockTrendingTopics = [
  { id: 1, name: "travel", count: 12500 },
  { id: 2, name: "cooking", count: 9800 },
  { id: 3, name: "fitness", count: 8700 },
  { id: 4, name: "technology", count: 7600 },
  { id: 5, name: "music", count: 6500 },
  { id: 6, name: "art", count: 5400 },
]

// Mock data for popular videos
const mockPopularVideos = [
  {
    id: 1,
    title: "Mountain hiking adventure",
    thumbnail: "/placeholder.svg",
    views: 45000,
    user: {
      name: "Nature Explorers",
      username: "natureexplorers",
    },
  },
  {
    id: 2,
    title: "5-minute ab workout",
    thumbnail: "/placeholder.svg",
    views: 38000,
    user: {
      name: "Fitness Pro",
      username: "fitnesspro",
    },
  },
  {
    id: 3,
    title: "Easy pasta recipe",
    thumbnail: "/placeholder.svg",
    views: 32000,
    user: {
      name: "Cooking Master",
      username: "cookingmaster",
    },
  },
]

export default function VideoSidebar() {
  const [creators, setCreators] = useState(mockCreators)
  const [trendingTopics] = useState(mockTrendingTopics)
  const [popularVideos] = useState(mockPopularVideos)

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const toggleFollow = (creatorId: number) => {
    setCreators(
      creators.map((creator) =>
        creator.id === creatorId ? { ...creator, isFollowing: !creator.isFollowing } : creator,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader className="border-b border-gray-800 pb-3">
          <CardTitle className="text-lg">Suggested Creators</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {creators.map((creator) => (
              <div key={creator.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Link href={`/profile/${creator.username}`}>
                    <Avatar>
                      <AvatarImage src={creator.avatar} alt={creator.name} />
                      <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link href={`/profile/${creator.username}`} className="font-medium text-white hover:underline">
                      {creator.name}
                    </Link>
                    <p className="text-xs text-gray-400">{formatNumber(creator.followers)} followers</p>
                  </div>
                </div>
                <Button
                  variant={creator.isFollowing ? "outline" : "default"}
                  size="sm"
                  className={
                    creator.isFollowing
                      ? "border-gray-700 hover:bg-gray-800 hover:text-white"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                  onClick={() => toggleFollow(creator.id)}
                >
                  {creator.isFollowing ? (
                    "Following"
                  ) : (
                    <>
                      <UserPlus className="mr-1 h-3 w-3" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-800 bg-gray-900">
        <CardHeader className="border-b border-gray-800 pb-3">
          <CardTitle className="text-lg">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/videos/topics/${topic.name}`}
                className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300 hover:bg-gray-700"
              >
                #{topic.name}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-800 bg-gray-900">
        <CardHeader className="border-b border-gray-800 pb-3">
          <CardTitle className="text-lg">Popular Videos</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {popularVideos.map((video) => (
              <div key={video.id} className="space-y-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image src={video.thumbnail || "/placeholder.svg"} alt={video.title} fill className="object-cover" />
                </div>
                <h3 className="font-medium text-white">{video.title}</h3>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <Link href={`/profile/${video.user.username}`} className="hover:text-gray-300">
                    {video.user.name}
                  </Link>
                  <span>{formatNumber(video.views)} views</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

