"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, MoreHorizontal, Share2, ThumbsUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for posts
const mockPosts = [
  {
    id: 1,
    user: {
      id: 1,
      name: "Jane Smith",
      avatar: "/placeholder-user.jpg",
      username: "janesmith",
    },
    content: "Just finished a great book! What are you all reading these days? 📚",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 5,
    shares: 2,
    hasLiked: false,
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Mike Johnson",
      avatar: "/placeholder-user.jpg",
      username: "mikejohnson",
    },
    content: "Beautiful sunset at the beach today! 🌅",
    image: "/placeholder.svg",
    timestamp: "5 hours ago",
    likes: 56,
    comments: 8,
    shares: 3,
    hasLiked: true,
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "Sarah Williams",
      avatar: "/placeholder-user.jpg",
      username: "sarahwilliams",
    },
    content:
      "Just got my new gaming setup! Can't wait to try it out this weekend. Who's up for some multiplayer action?",
    timestamp: "1 day ago",
    likes: 42,
    comments: 12,
    shares: 5,
    hasLiked: false,
  },
]

export default function PostFeed() {
  const [posts, setPosts] = useState(mockPosts)
  const [commentText, setCommentText] = useState("")
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
            hasLiked: !post.hasLiked,
          }
        }
        return post
      }),
    )
  }

  const handleComment = (postId: number) => {
    setActiveCommentId(activeCommentId === postId ? null : postId)
    setCommentText("")
  }

  const submitComment = (postId: number) => {
    if (!commentText.trim()) return

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
          }
        }
        return post
      }),
    )

    setCommentText("")
    // In a real app, you would send the comment to the server
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="border-gray-800 bg-gray-900">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={post.user.avatar} alt={post.user.name} />
                <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/profile/${post.user.username}`} className="font-semibold text-white hover:underline">
                  {post.user.name}
                </Link>
                <p className="text-xs text-gray-400">{post.timestamp}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-gray-800 bg-gray-900 text-white">
                <DropdownMenuItem className="cursor-pointer">Save Post</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Report Post</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Hide Post</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <Link href={`/post/${post.id}`}>
              <p className="mb-3 text-white">{post.content}</p>
              {post.image && (
                <div className="mt-3 overflow-hidden rounded-lg">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt="Post image"
                    width={600}
                    height={400}
                    className="h-auto w-full object-cover"
                  />
                </div>
              )}
            </Link>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-gray-800 px-4 py-2">
            <div className="flex items-center justify-between py-1 text-sm text-gray-400">
              <div>{post.likes} likes</div>
              <Link href={`/post/${post.id}`} className="hover:underline">
                {post.comments} comments • {post.shares} shares
              </Link>
            </div>
            <div className="flex border-t border-gray-800 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className={`flex-1 ${post.hasLiked ? "text-blue-500" : "text-gray-400"}`}
                onClick={() => handleLike(post.id)}
              >
                {post.hasLiked ? (
                  <Heart className="mr-1 h-5 w-5 fill-blue-500" />
                ) : (
                  <ThumbsUp className="mr-1 h-5 w-5" />
                )}
                <span>Like</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-gray-400" onClick={() => handleComment(post.id)}>
                <MessageCircle className="mr-1 h-5 w-5" />
                <span>Comment</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-gray-400">
                <Share2 className="mr-1 h-5 w-5" />
                <span>Share</span>
              </Button>
            </div>
            {activeCommentId === post.id && (
              <div className="mt-3 flex items-start space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="Your avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a comment..."
                    className="min-h-[60px] resize-none border-gray-800 bg-gray-800 text-white"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => submitComment(post.id)}
                      disabled={!commentText.trim()}
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

