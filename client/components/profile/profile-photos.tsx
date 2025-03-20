"use client"

import Link from "next/link"
import { useState } from "react"
import { MoreHorizontal } from "lucide-react"

interface Photo {
  id: number
  url: string
  caption?: string
  timestamp: string
}

interface ProfilePhotosProps {
  userId: number
}

export default function ProfilePhotos({ userId }: ProfilePhotosProps) {
  const [showDropdown, setShowDropdown] = useState<number | null>(null)

  // In a real app, you would fetch this data from an API
  const photos: Photo[] = [
    {
      id: 1,
      url: "/placeholder-image.jpg",
      caption: "Beautiful sunset at the beach",
      timestamp: "2 days ago",
    },
    {
      id: 2,
      url: "/placeholder-image.jpg",
      caption: "Weekend hiking adventure",
      timestamp: "1 week ago",
    },
    {
      id: 3,
      url: "/placeholder-image.jpg",
      caption: "City lights at night",
      timestamp: "2 weeks ago",
    },
    {
      id: 4,
      url: "/placeholder-image.jpg",
      caption: "Morning coffee vibes",
      timestamp: "3 weeks ago",
    },
    {
      id: 5,
      url: "/placeholder-image.jpg",
      timestamp: "1 month ago",
    },
    {
      id: 6,
      url: "/placeholder-image.jpg",
      timestamp: "1 month ago",
    },
  ]

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Photos</h2>
          <p className="text-sm text-gray-400">{photos.length} photos</p>
        </div>
        <Link
          href={`/profile/${userId}/photos`}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          See all photos
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <img src={photo.url} alt={photo.caption || "Photo"} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <button
              onClick={() => setShowDropdown(showDropdown === photo.id ? null : photo.id)}
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900/50 opacity-0 hover:bg-gray-800 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showDropdown === photo.id && (
              <div className="absolute right-0 top-12 z-50 w-48 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                <button
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800"
                  onClick={() => setShowDropdown(null)}
                >
                  View Photo
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800"
                  onClick={() => setShowDropdown(null)}
                >
                  Download
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800"
                  onClick={() => setShowDropdown(null)}
                >
                  Report Photo
                </button>
              </div>
            )}
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm text-white">{photo.caption}</p>
                <p className="mt-1 text-xs text-gray-300">{photo.timestamp}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

