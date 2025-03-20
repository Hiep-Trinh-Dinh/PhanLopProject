"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react"
import CommentList from "./comment-list"

interface User {
  id: number
  name: string
  username: string
  avatar: string
}

interface Post {
  id: number
  user: User
  content: string
  image?: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  hasLiked: boolean
}

interface PostDetailProps {
  post: Post
}

export default function PostDetail({ post }: PostDetailProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLiked, setIsLiked] = useState(post.hasLiked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsSubmitting(true)

    // In a real app, you would send the comment to the server
    setTimeout(() => {
      setCommentText("")
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <img src={post.user.avatar} alt={post.user.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                  {post.user.name.charAt(0)}
                </div>
              </div>
              <div>
                <Link href={`/profile/${post.user.username}`} className="font-semibold text-white hover:underline">
                  {post.user.name}
                </Link>
                <p className="text-sm text-gray-400">{post.timestamp}</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-800"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">More options</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                    onClick={() => setShowDropdown(false)}
                  >
                    Save Post
                  </button>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                    onClick={() => setShowDropdown(false)}
                  >
                    Report Post
                  </button>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                    onClick={() => setShowDropdown(false)}
                  >
                    Hide Post
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-white">{post.content}</p>
            {post.image && (
              <div className="mt-4 overflow-hidden rounded-lg">
                <Image
                  src={post.image}
                  alt="Post image"
                  width={600}
                  height={400}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 ${isLiked ? "text-blue-500" : "text-gray-400"}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-blue-500" : ""}`} />
                <span>{likesCount} Likes</span>
              </button>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments} Comments</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Share2 className="h-5 w-5" />
                <span>{post.shares} Shares</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 p-4">
          <form onSubmit={handleSubmitComment} className="flex items-start space-x-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <img src="/placeholder-user.jpg" alt="Your avatar" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">U</div>
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Write a comment..."
                className="min-h-[60px] w-full resize-none rounded-md border border-gray-800 bg-gray-800 p-2 text-sm text-white placeholder-gray-400 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={!commentText.trim() || isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="border-t border-gray-800 p-4">
          <CommentList postId={post.id} />
        </div>
      </div>
    </div>
  )
}

