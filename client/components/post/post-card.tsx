"use client"

import Image from "next/image"
import { Heart, MessageCircle } from "lucide-react"
import { formatTimeAgo } from "@/lib/utils"

interface Post {
  id: string
  content: string
  image?: string
  createdAt: string
  likes: number
  comments: number
  author: {
    name: string
    image: string
  }

  User: {
    id: string
    fristName: string
    lastName: string
    image: string
  }
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12">
            <Image 
              src={post.author.image || '/placeholder-user.jpg'}
              alt={post.author.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">{post.author.name}</h3>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-4">
        <p className="text-sm sm:text-base">{post.content}</p>
        {post.image && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={post.image}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-2 sm:space-x-4">
          <button className="flex items-center space-x-1 text-sm sm:text-base">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{post.likes}</span>
          </button>
          <button className="flex items-center space-x-1 text-sm sm:text-base">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{post.comments}</span>
          </button>
        </div>
      </div>
    </div>
  )
} 