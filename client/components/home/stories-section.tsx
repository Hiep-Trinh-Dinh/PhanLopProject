"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

const mockStories = [
  {
    id: 1,
    user: {
      name: "Your Story",
      avatar: "/placeholder-user.jpg",
    },
    image: "/placeholder.svg",
    isYourStory: true,
  },
  {
    id: 2,
    user: {
      name: "John Doe",
      avatar: "/placeholder-user.jpg",
    },
    image: "/placeholder.svg",
  },
  {
    id: 3,
    user: {
      name: "Jane Smith",
      avatar: "/placeholder-user.jpg",
    },
    image: "/placeholder.svg",
  },
  {
    id: 4,
    user: {
      name: "Mike Johnson",
      avatar: "/placeholder-user.jpg",
    },
    image: "/placeholder.svg",
  },
  {
    id: 5,
    user: {
      name: "Sarah Wilson",
      avatar: "/placeholder-user.jpg",
    },
    image: "/placeholder.svg",
  },
  {
    id: 6,
    user: {
      name: "Alex Brown",
      avatar: "/placeholder-user.jpg",
    },
    image: "/placeholder.svg",
  },
]

export default function StoriesSection() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollAmount = 200

  const scrollLeft = () => {
    const newPosition = Math.max(0, scrollPosition - scrollAmount)
    setScrollPosition(newPosition)
    const container = document.getElementById("stories-container")
    if (container) {
      container.scrollTo({ left: newPosition, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    const container = document.getElementById("stories-container")
    if (container) {
      const maxScroll = container.scrollWidth - container.clientWidth
      const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount)
      setScrollPosition(newPosition)
      container.scrollTo({ left: newPosition, behavior: "smooth" })
    }
  }

  return (
    <div className="relative">
      <div
        id="stories-container"
        className="no-scrollbar flex space-x-2 overflow-x-hidden scroll-smooth"
      >
        {mockStories.map((story) => (
          <div
            key={story.id}
            className="relative h-48 w-32 flex-none cursor-pointer overflow-hidden rounded-lg"
          >
            <img
              src={story.image}
              alt={story.user.name}
              className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              {story.isYourStory ? (
                <div className="mb-2 flex justify-center">
                  <button className="rounded-full bg-blue-600 p-2 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mb-2 flex justify-center">
                  <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-blue-500">
                    <img
                      src={story.user.avatar}
                      alt={story.user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
              <p className="text-center text-sm font-medium text-white">{story.user.name}</p>
            </div>
          </div>
        ))}
      </div>

      {scrollPosition > 0 && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-gray-900/80 p-1 text-white shadow-lg hover:bg-gray-900"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-gray-900/80 p-1 text-white shadow-lg hover:bg-gray-900"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  )
}

