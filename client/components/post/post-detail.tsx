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
import CommentList from "./comment-list"

interface PostDetailProps {
  post: {
    id: number
    user: {
      id: number
      name: string
      avatar: string
      username: string
    }
    content: string
    image?: string
    timestamp: string
    likes: number
    comments: number
    shares: number
    hasLiked: boolean
  }
}

export default function PostDetail({ post }: PostDetailProps) {
  const [hasLiked, setHasLiked] = useState(post.hasLiked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showComments, setShowComments] = useState(true)

  const handleLike = () => {
    setHasLiked(!hasLiked)
    setLikesCount(hasLiked ? likesCount - 1 : likesCount + 1)
  }

  const handleSubmitComment = () => {
    if (!commentText.trim()) return

    setIsSubmitting(true)

    // In a real app, you would send the comment to the server
    setTimeout(() => {
      setCommentText("")
      setIsSubmitting(false)
      // In a real app, you would update the comments list with the new comment
    }, 500)
  }

  return (
    <div className="space-y-4">
      <Card className="border-gray-800 bg-gray-900">
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
        </CardContent>
        <CardFooter className="flex flex-col border-t border-gray-800 px-4 py-2">
          <div className="flex items-center justify-between py-1 text-sm text-gray-400">
            <div>{likesCount} likes</div>
            <div>
              {post.comments} comments • {post.shares} shares
            </div>
          </div>
          <div className="flex border-t border-gray-800 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${hasLiked ? "text-blue-500" : "text-gray-400"}`}
              onClick={handleLike}
            >
              {hasLiked ? <Heart className="mr-1 h-5 w-5 fill-blue-500" /> : <ThumbsUp className="mr-1 h-5 w-5" />}
              <span>Like</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-gray-400"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="mr-1 h-5 w-5" />
              <span>Comment</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-gray-400">
              <Share2 className="mr-1 h-5 w-5" />
              <span>Share</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {showComments && (
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
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
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>

          <CommentList postId={post.id} />
        </div>
      )}
    </div>
  )
}

