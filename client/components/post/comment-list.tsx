"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, MoreHorizontal, Reply } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CommentListProps {
  postId: number
}

// Mock data for comments
const mockComments = {
  1: [
    {
      id: 1,
      user: {
        id: 2,
        name: "Mike Johnson",
        username: "mikejohnson",
        avatar: "/placeholder-user.jpg",
      },
      content: "I just finished 'The Midnight Library' by Matt Haig. Highly recommend it!",
      timestamp: "1 hour ago",
      likes: 5,
      hasLiked: false,
      replies: [
        {
          id: 101,
          user: {
            id: 3,
            name: "Sarah Williams",
            username: "sarahwilliams",
            avatar: "/placeholder-user.jpg",
          },
          content: "I loved that book too! The concept was so interesting.",
          timestamp: "45 minutes ago",
          likes: 2,
          hasLiked: false,
        },
      ],
    },
    {
      id: 2,
      user: {
        id: 4,
        name: "David Brown",
        username: "davidbrown",
        avatar: "/placeholder-user.jpg",
      },
      content: "Currently reading 'Project Hail Mary' by Andy Weir. It's a great sci-fi novel!",
      timestamp: "30 minutes ago",
      likes: 3,
      hasLiked: false,
      replies: [],
    },
  ],
  2: [
    {
      id: 3,
      user: {
        id: 1,
        name: "Jane Smith",
        username: "janesmith",
        avatar: "/placeholder-user.jpg",
      },
      content: "Wow, that's absolutely stunning! Where was this taken?",
      timestamp: "4 hours ago",
      likes: 8,
      hasLiked: true,
      replies: [
        {
          id: 102,
          user: {
            id: 2,
            name: "Mike Johnson",
            username: "mikejohnson",
            avatar: "/placeholder-user.jpg",
          },
          content: "This was at Malibu Beach in California. The sunsets there are amazing!",
          timestamp: "3 hours ago",
          likes: 4,
          hasLiked: false,
        },
      ],
    },
    {
      id: 4,
      user: {
        id: 5,
        name: "Emily Davis",
        username: "emilydavis",
        avatar: "/placeholder-user.jpg",
      },
      content: "The colors are incredible! 😍",
      timestamp: "2 hours ago",
      likes: 6,
      hasLiked: false,
      replies: [],
    },
  ],
  3: [
    {
      id: 5,
      user: {
        id: 2,
        name: "Mike Johnson",
        username: "mikejohnson",
        avatar: "/placeholder-user.jpg",
      },
      content: "Nice setup! What games are you planning to play first?",
      timestamp: "20 hours ago",
      likes: 4,
      hasLiked: false,
      replies: [],
    },
    {
      id: 6,
      user: {
        id: 6,
        name: "Chris Wilson",
        username: "chriswilson",
        avatar: "/placeholder-user.jpg",
      },
      content: "I'm down for some multiplayer! What's your gamertag?",
      timestamp: "18 hours ago",
      likes: 2,
      hasLiked: false,
      replies: [],
    },
  ],
}

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState(mockComments[postId as keyof typeof mockComments] || [])
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const handleLikeComment = (commentId: number) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            hasLiked: !comment.hasLiked,
            likes: comment.hasLiked ? comment.likes - 1 : comment.likes + 1,
          }
        }
        return comment
      }),
    )
  }

  const handleLikeReply = (commentId: number, replyId: number) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === replyId) {
                return {
                  ...reply,
                  hasLiked: !reply.hasLiked,
                  likes: reply.hasLiked ? reply.likes - 1 : reply.likes + 1,
                }
              }
              return reply
            }),
          }
        }
        return comment
      }),
    )
  }

  const handleSubmitReply = (commentId: number) => {
    if (!replyText.trim()) return

    setIsSubmittingReply(true)

    // In a real app, you would send the reply to the server
    setTimeout(() => {
      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [
                ...comment.replies,
                {
                  id: Math.floor(Math.random() * 1000) + 200, // Generate a random ID
                  user: {
                    id: 999, // Current user ID
                    name: "John Doe", // Current user name
                    username: "johndoe", // Current user username
                    avatar: "/placeholder-user.jpg", // Current user avatar
                  },
                  content: replyText,
                  timestamp: "Just now",
                  likes: 0,
                  hasLiked: false,
                },
              ],
            }
          }
          return comment
        }),
      )

      setReplyText("")
      setReplyingTo(null)
      setIsSubmittingReply(false)
    }, 500)
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
        <p className="text-gray-400">No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">Comments ({comments.length})</h3>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/profile/${comment.user.username}`}
                        className="font-semibold text-white hover:underline"
                      >
                        {comment.user.name}
                      </Link>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-gray-800 bg-gray-900 text-white">
                        <DropdownMenuItem className="cursor-pointer">Report Comment</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Copy Text</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                    <span>{comment.timestamp}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-auto p-0 ${comment.hasLiked ? "text-blue-500" : "text-gray-400"}`}
                      onClick={() => handleLikeComment(comment.id)}
                    >
                      <Heart className={`mr-1 h-4 w-4 ${comment.hasLiked ? "fill-blue-500" : ""}`} />
                      <span>{comment.likes} Likes</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-gray-400"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      <Reply className="mr-1 h-4 w-4" />
                      <span>Reply</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="ml-10 flex items-start space-x-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/placeholder-user.jpg" alt="Your avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={`Reply to ${comment.user.name}...`}
                    className="min-h-[60px] resize-none border-gray-800 bg-gray-800 text-white"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800 hover:text-white"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyText.trim() || isSubmittingReply}
                    >
                      {isSubmittingReply ? "Posting..." : "Reply"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="ml-10 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
                        <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/profile/${reply.user.username}`}
                              className="font-semibold text-white hover:underline"
                            >
                              {reply.user.name}
                            </Link>
                            <p className="text-sm text-gray-300">{reply.content}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3 w-3" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-gray-800 bg-gray-900 text-white">
                              <DropdownMenuItem className="cursor-pointer">Report Reply</DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">Copy Text</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                          <span>{reply.timestamp}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-auto p-0 ${reply.hasLiked ? "text-blue-500" : "text-gray-400"}`}
                            onClick={() => handleLikeReply(comment.id, reply.id)}
                          >
                            <Heart className={`mr-1 h-3 w-3 ${reply.hasLiked ? "fill-blue-500" : ""}`} />
                            <span>{reply.likes} Likes</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

