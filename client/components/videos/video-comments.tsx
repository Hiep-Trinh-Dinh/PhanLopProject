"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, MoreHorizontal } from "lucide-react"

interface Comment {
  id: number
  content: string
  timestamp: string
  likes: number
  hasLiked: boolean
  user: {
    id: number
    name: string
    username: string
    avatar: string
  }
  replies?: Comment[]
}

interface VideoCommentsProps {
  videoId: number
}

export default function VideoComments({ videoId }: VideoCommentsProps) {
  const [mounted, setMounted] = useState(false)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      content: "Great video! Really enjoyed the content.",
      timestamp: "2 hours ago",
      likes: 24,
      hasLiked: false,
      user: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
        avatar: "/placeholder-user.jpg",
      },
      replies: [
        {
          id: 2,
          content: "Thanks! Glad you enjoyed it!",
          timestamp: "1 hour ago",
          likes: 8,
          hasLiked: true,
          user: {
            id: 2,
            name: "Jane Smith",
            username: "janesmith",
            avatar: "/placeholder-user.jpg",
          },
        },
      ],
    },
    {
      id: 3,
      content: "Very informative, looking forward to more content like this!",
      timestamp: "3 hours ago",
      likes: 15,
      hasLiked: false,
      user: {
        id: 3,
        name: "Mike Johnson",
        username: "mikejohnson",
        avatar: "/placeholder-user.jpg",
      },
    },
  ])

  const [newComment, setNewComment] = useState("")
  const [showDropdown, setShowDropdown] = useState<number | null>(null)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

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
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
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

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const newCommentObj: Comment = {
      id: Math.floor(Math.random() * 1000) + 100,
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      hasLiked: false,
      user: {
        id: 999, // Current user ID
        name: "Current User",
        username: "currentuser",
        avatar: "/placeholder-user.jpg",
      },
    }

    setComments([newCommentObj, ...comments])
    setNewComment("")
  }

  const handleSubmitReply = (commentId: number) => {
    if (!replyText.trim()) return

    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          const newReply: Comment = {
            id: Math.floor(Math.random() * 1000) + 200,
            content: replyText,
            timestamp: "Just now",
            likes: 0,
            hasLiked: false,
            user: {
              id: 999, // Current user ID
              name: "Current User",
              username: "currentuser",
              avatar: "/placeholder-user.jpg",
            },
          }

          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          }
        }
        return comment
      }),
    )

    setReplyText("")
    setReplyingTo(null)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmitComment} className="flex items-start space-x-4">
        <div className="relative h-10 w-10 overflow-hidden rounded-full">
          <img src="/placeholder-user.jpg" alt="Your avatar" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <textarea
            placeholder="Add a comment..."
            className="min-h-[80px] w-full resize-none rounded-lg border border-gray-800 bg-gray-800 p-3 text-white placeholder-gray-400 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Comment
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <div className="flex space-x-4">
              <Link href={`/profile/${comment.user.username}`}>
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <img src={comment.user.avatar} alt={comment.user.name} className="h-full w-full object-cover" />
                </div>
              </Link>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/profile/${comment.user.username}`}
                      className="font-medium text-white hover:underline"
                    >
                      {comment.user.name}
                    </Link>
                    <p className="mt-1 text-gray-300">{comment.content}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                      <span>{comment.timestamp}</span>
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center space-x-1 ${comment.hasLiked ? "text-blue-500" : ""}`}
                      >
                        <Heart className={`h-4 w-4 ${comment.hasLiked ? "fill-blue-500" : ""}`} />
                        <span>{comment.likes}</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="hover:text-white"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(showDropdown === comment.id ? null : comment.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-800"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                    {showDropdown === comment.id && (
                      <div className="absolute right-0 z-50 mt-1 w-48 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                        <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                          Report Comment
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                          Copy Text
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {replyingTo === comment.id && (
                  <div className="mt-4 flex items-start space-x-4">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                      <img src="/placeholder-user.jpg" alt="Your avatar" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        placeholder={`Reply to ${comment.user.name}...`}
                        className="min-h-[60px] w-full resize-none rounded-lg border border-gray-800 bg-gray-800 p-2 text-sm text-white placeholder-gray-400 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyText.trim()}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4 pl-12">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-4">
                        <Link href={`/profile/${reply.user.username}`}>
                          <div className="relative h-8 w-8 overflow-hidden rounded-full">
                            <img src={reply.user.avatar} alt={reply.user.name} className="h-full w-full object-cover" />
                          </div>
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link
                                href={`/profile/${reply.user.username}`}
                                className="font-medium text-white hover:underline"
                              >
                                {reply.user.name}
                              </Link>
                              <p className="mt-1 text-sm text-gray-300">{reply.content}</p>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                                <span>{reply.timestamp}</span>
                                <button
                                  onClick={() => handleLikeComment(reply.id)}
                                  className={`flex items-center space-x-1 ${reply.hasLiked ? "text-blue-500" : ""}`}
                                >
                                  <Heart className={`h-3 w-3 ${reply.hasLiked ? "fill-blue-500" : ""}`} />
                                  <span>{reply.likes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

