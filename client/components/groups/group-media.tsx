"use client"

import { Image as ImageIcon, Play } from "lucide-react"

interface GroupMediaProps {
  groupId: number
}

export default function GroupMedia({ groupId }: GroupMediaProps) {
  const mediaItems = [
    { id: 1, type: "image", url: "/placeholder-image.jpg", title: "Project Screenshot" },
    { id: 2, type: "image", url: "/placeholder-image.jpg", title: "Team Meeting" },
    { id: 3, type: "video", url: "/placeholder-video.mp4", title: "Tutorial Video" },
    { id: 4, type: "image", url: "/placeholder-image.jpg", title: "Conference" },
    { id: 5, type: "video", url: "/placeholder-video.mp4", title: "Code Review" },
    { id: 6, type: "image", url: "/placeholder-image.jpg", title: "Workshop" },
  ]

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold">Media</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
            >
              <img
                src={item.url}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex items-center space-x-1 text-xs text-white">
                  {item.type === "image" ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  <span>{item.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full rounded-md border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800">
          View All Media
        </button>
      </div>
    </div>
  )
}

