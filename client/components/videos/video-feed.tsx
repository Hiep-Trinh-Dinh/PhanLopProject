"use client"

import { useState } from "react"
import VideoCard from "./video-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flame, Sparkles, Clock } from "lucide-react"

// Mock data for videos
const mockVideos = [
  {
    id: 1,
    title: "Amazing sunset at the beach",
    description: "Captured this beautiful moment during my vacation. #sunset #beach #nature",
    url: "/placeholder.svg",
    thumbnail: "/placeholder.svg",
    views: 12500,
    likes: 1250,
    comments: 85,
    shares: 42,
    createdAt: "2 days ago",
    user: {
      id: 1,
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/placeholder-user.jpg",
      followers: 5600,
    },
  },
  {
    id: 2,
    title: "Quick React.js tip for beginners",
    description: "Here's a useful tip that will help you write cleaner React code. #reactjs #webdev #coding",
    url: "/placeholder.svg",
    thumbnail: "/placeholder.svg",
    views: 8700,
    likes: 945,
    comments: 120,
    shares: 65,
    createdAt: "3 days ago",
    user: {
      id: 2,
      name: "Mike Johnson",
      username: "mikejohnson",
      avatar: "/placeholder-user.jpg",
      followers: 12300,
    },
  },
  {
    id: 3,
    title: "Morning coffee routine",
    description: "My daily ritual for the perfect cup of coffee. #coffee #morning #routine",
    url: "/placeholder.svg",
    thumbnail: "/placeholder.svg",
    views: 5400,
    likes: 620,
    comments: 45,
    shares: 28,
    createdAt: "1 week ago",
    user: {
      id: 3,
      name: "Sarah Williams",
      username: "sarahwilliams",
      avatar: "/placeholder-user.jpg",
      followers: 8900,
    },
  },
  {
    id: 4,
    title: "City lights at night",
    description: "Walking through downtown at night. The city never sleeps! #citylife #night #urban",
    url: "/placeholder.svg",
    thumbnail: "/placeholder.svg",
    views: 9200,
    likes: 1100,
    comments: 72,
    shares: 38,
    createdAt: "5 days ago",
    user: {
      id: 4,
      name: "David Brown",
      username: "davidbrown",
      avatar: "/placeholder-user.jpg",
      followers: 7500,
    },
  },
  {
    id: 5,
    title: "Easy 10-minute workout",
    description: "No equipment needed for this quick but effective workout. #fitness #workout #health",
    url: "/placeholder.svg",
    thumbnail: "/placeholder.svg",
    views: 15800,
    likes: 2200,
    comments: 130,
    shares: 95,
    createdAt: "2 days ago",
    user: {
      id: 5,
      name: "Emily Davis",
      username: "emilydavis",
      avatar: "/placeholder-user.jpg",
      followers: 18700,
    },
  },
]

export default function VideoFeed() {
  const [videos, setVideos] = useState(mockVideos)
  const [activeTab, setActiveTab] = useState("trending")
  const [isLoading, setIsLoading] = useState(false)

  const loadMoreVideos = () => {
    setIsLoading(true)
    // In a real app, you would fetch more videos from an API
    setTimeout(() => {
      // Clone and modify some videos to simulate new content
      const newVideos = videos.slice(0, 3).map((video) => ({
        ...video,
        id: video.id + videos.length,
        title: `${video.title} (New)`,
        views: Math.floor(video.views * 0.7),
        likes: Math.floor(video.likes * 0.7),
        comments: Math.floor(video.comments * 0.7),
        shares: Math.floor(video.shares * 0.7),
        createdAt: "Just now",
      }))

      setVideos([...videos, ...newVideos])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trending" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="trending">
            <Flame className="mr-2 h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="following">
            <Sparkles className="mr-2 h-4 w-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="mr-2 h-4 w-4" />
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-6 space-y-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </TabsContent>

        <TabsContent value="following" className="mt-6 space-y-6">
          {videos
            .filter((_, index) => index % 2 === 0) // Just for demo, show different videos
            .map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
        </TabsContent>

        <TabsContent value="recent" className="mt-6 space-y-6">
          {videos
            .filter((_, index) => index % 2 === 1) // Just for demo, show different videos
            .map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-4">
        <Button onClick={loadMoreVideos} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? "Loading..." : "Load More Videos"}
        </Button>
      </div>
    </div>
  )
}

