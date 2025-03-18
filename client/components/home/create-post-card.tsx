"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Image, Smile, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function CreatePostCard() {
  const [postText, setPostText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would handle post creation here
    console.log("Creating post:", postText)
    setPostText("")
  }

  return (
    <Card className="border-gray-800 bg-gray-900">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[80px] flex-1 resize-none border-gray-800 bg-gray-800 text-white"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-gray-800 bg-gray-900 px-4 py-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" className="text-gray-400">
                <Image className="mr-1 h-5 w-5" />
                <span>Photo</span>
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-gray-400">
                <Video className="mr-1 h-5 w-5" />
                <span>Video</span>
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-gray-400">
                <Camera className="mr-1 h-5 w-5" />
                <span>Live</span>
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-gray-400">
                <Smile className="mr-1 h-5 w-5" />
                <span>Feeling</span>
              </Button>
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!postText.trim()}>
              Post
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

