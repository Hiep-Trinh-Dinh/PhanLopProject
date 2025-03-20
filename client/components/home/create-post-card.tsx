"use client"

import type React from "react"
import { useState } from "react"
import { Camera, Image, Smile, Video } from "lucide-react"

export default function CreatePostCard() {
  const [postText, setPostText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would handle post creation here
    console.log("Creating post:", postText)
    setPostText("")
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 p-4">
          <div className="flex gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <img src="/placeholder-user.jpg" alt="User" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                U
              </div>
            </div>
            <textarea
              placeholder="What's on your mind?"
              className="min-h-[80px] w-full resize-none rounded-md border border-gray-800 bg-gray-800 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
          </div>
        </div>
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800"
              >
                <Image className="mr-1 h-5 w-5" />
                <span>Photo</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800"
              >
                <Video className="mr-1 h-5 w-5" />
                <span>Video</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800"
              >
                <Camera className="mr-1 h-5 w-5" />
                <span>Live</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800"
              >
                <Smile className="mr-1 h-5 w-5" />
                <span>Feeling</span>
              </button>
            </div>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={!postText.trim()}
            >
              Post
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

