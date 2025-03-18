"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Mock data for stories
const mockStories = [
  {
    id: 1,
    user: {
      id: 1,
      name: "Your Story",
      avatar: "/placeholder-user.jpg",
    },
    image: null,
    isYourStory: true,
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Jane Smith",
      avatar: "/placeholder-user.jpg",
    },
    image: "/placeholder.svg",
    isYourStory: false,
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "Mike Johnson",
      avatar: "/placeholder-user.jpg",
    },
    image: "/placeholder.svg",
    isYourStory: false,
  },
  {
    id: 4,
    user: {
      id: 4,
      name: "Sarah Williams",
      avatar: "/placeholder-user.jpg",
    },
    image: "/placeholder.svg",
    isYourStory: false,
  },
  {
    id: 5,
    user: {
      id: 5,
      name: "David Brown",
      avatar: "/placeholder-user.jpg",
    },
    image: "/placeholder.svg",
    isYourStory: false,
  },
  {
    id: 6,
    user: {
      id: 6,
      name: "Emily Davis",
      avatar: "/placeholder-user.jpg",
    },
    image: "/placeholder.svg",
    isYourStory: false,
  },
]

export default function StoriesSection() {
  const [stories] = useState(mockStories)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = 200

      if (direction === "left") {
        current.scrollLeft -= scrollAmount
      } else {
        current.scrollLeft += scrollAmount
      }
    }
  }

  return (
    <div className="relative">
      <div className="absolute -left-4 top-1/2 z-10 -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-gray-800 shadow-md"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {stories.map((story) => (
          <Card
            key={story.id}
            className="relative h-48 w-28 flex-shrink-0 overflow-hidden rounded-xl border-gray-800 bg-gray-900"
          >
            {story.image ? (
              <Image src={story.image || "/placeholder.svg"} alt={story.user.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-800">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
            <div className="absolute left-0 top-0 p-2">
              <div className="rounded-full border-2 border-blue-500 p-0.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={story.user.avatar} alt={story.user.name} />
                  <AvatarFallback>{story.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 p-2">
              <p className="text-xs font-medium text-white">{story.user.name}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="absolute -right-4 top-1/2 z-10 -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-gray-800 shadow-md"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

