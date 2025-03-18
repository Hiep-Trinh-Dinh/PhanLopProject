"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, MoreHorizontal, Reply } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface VideoCommentsProps {
  videoId: number
  commentCount: number
}

// Mock data for video comments
const mockVideoComments = {
  1: [
    {
      id: 1,
      user: {
        id: 2,
        name: "Mike Johnson",
        username: "mikejohnson",
        avatar: "/placeholder-user.jpg",
      },
      content: "This sunset is absolutely breathtaking! Where was this filmed?",
      timestamp: "1 day ago",
      likes: 42,
      hasLiked: false,
      replies: [
        {
          id: 101,
          user: {
            id: 1,
            name: "Jane Smith",
            username: "janesmith",
            avatar: "/placeholder-user.jpg",
          },
          content: "Thanks! This was at Malibu Beach in California. The sunsets there are amazing!",
          timestamp: "23 hours ago",
          likes: 18,
          hasLiked: false,
        },
        {
          id: 102,
          user: {
            id: 3,
            name: "Sarah Williams",
            username: "sarahwilliams",
            avatar: "/placeholder-user.jpg",
          },
          content: "I've been there too! Such a beautiful place.",
          timestamp: "20 hours ago",
          likes: 7,
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
      content: "The colors in this video are incredible. What camera did you use?",
      timestamp: "18 hours ago",
      likes: 15,
      hasLiked: false,
      replies: [],
    },
    {
      id: 3,
      user: {
        id: 5,
        name: "Emily Davis",
        username: "emilydavis",
        avatar: "/placeholder-user.jpg",
      },
      content: "This makes me want to go to the beach right now! 🏖️",
      timestamp: "12 hours ago",
      likes: 28,
      hasLiked: false,
      replies: [],
    },
  ],
  2: [
    {
      id: 4,
      user: {
        id: 3,
        name: "Sarah Williams",
        username: "sarahwilliams",
        avatar: "/placeholder-user.jpg",
      },
      content: "This tip saved me so much time! Thanks for sharing.",
      timestamp: "2 days ago",
      likes: 56,
      hasLiked: true,
      replies: [
        {
          id: 103,
          user: {
            id: 2,
            name: "Mike Johnson",
            username: "mikejohnson",
            avatar: "/placeholder-user.jpg",
          },
          content: "Glad you found it helpful! I'll be sharing more tips like this soon.",
          timestamp: "1 day ago",
          likes: 12,
          hasLiked: false,
        },
      ],
    },
    {
      id: 5,
      user: {
        id: 6,
        name: "Chris Wilson",
        username: "chriswilson",
        avatar: "/placeholder-user.jpg",
      },
      content: "I've been coding React for years and never knew this trick. Great content!",
      timestamp: "1 day ago",
      likes: 34,
      hasLiked: false,
      replies: [],
    },
  ],
  3: [
    {
      id: 6,
      user: {
        id: 4,
        name: "David Brown",
        username: "davidbrown",
        avatar: "/placeholder-user.jpg",
      },
      content: "I'm definitely trying this coffee routine tomorrow morning!",
      timestamp: "5 days ago",
      likes: 21,
      hasLiked: false,
      replies: [],
    },
    {
      id: 7,
      user: {
        id: 5,
        name: "Emily Davis",
        username: "emilydavis",
        avatar: "/placeholder-user.jpg",
      },
      content: "What brand of coffee do you use? It looks delicious!",
      timestamp: "4 days ago",
      likes: 15,
      hasLiked: false,
      replies: [
        {
          id: 104,
          user: {
            id: 3,
            name: "Sarah Williams",
            username: "sarahwilliams",
            avatar: "/placeholder-user.jpg",
          },
          content:
            "I use a local brand called 'Morning Brew'. It's a medium roast with hints of chocolate and caramel.",
          timestamp: "3 days ago",
          likes: 8,
          hasLiked: false,
        },
      ],
    },
  ],
  4: [
    {
      id: 8,
      user: {
        id: 2,
        name: "Mike Johnson",
        username: "mikejohnson",
        avatar: "/placeholder-user.jpg",
      },
      content: "This reminds me of my trip to New York last year. The city is magical at night!",
      timestamp: "3 days ago",
      likes: 32,
      hasLiked: false,
      replies: [],
    },
  ],
  5: [
    {
      id: 9,
      user: {
        id: 3,
        name: "Sarah Williams",
        username: "sarahwilliams",
        avatar: "/placeholder-user.jpg",
      },
      content: "I do this workout every morning and it's been a game-changer for my energy levels!",
      timestamp: "1 day ago",
      likes: 45,
      hasLiked: false,
      replies: [],
    },
    {
      id: 10,
      user: {
        id: 6,
        name: "Chris Wilson",
        username: "chriswilson",
        avatar: "/placeholder-user.jpg",
      },
      content: "Is this suitable for beginners? I'm just starting my fitness journey.",
      timestamp: "1 day ago",
      likes: 18,
      hasLiked: false,
      replies: [
        {
          id: 105,
          user: {
            id: 5,
            name: "Emily Davis",
            username: "emilydavis",
            avatar: "/placeholder-user.jpg",
          },
          content:
            "I'm a certified trainer and this is perfect for beginners. Just take it at your own pace and focus on form rather than speed.",
          timestamp: "20 hours ago",
          likes: 22,
          hasLiked: false,
        },
      ],
    },
  ],
}

export default function VideoComments({ videoId, commentCount }: VideoCommentsProps) {
  const [comments, setComments] = useState(mockVideoComments[videoId as keyof typeof mockVideoComments] || [])
  const [commentText, setCommentText] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [activeTab, setActiveTab] = useState("newest")

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

  const handleSubmitComment = () => {
    if (!commentText.trim()) return

    setIsSubmitting(true)

    // In a real app, you would send the comment to the server
    setTimeout(() => {
      const newComment = {
        id: Math.floor(Math.random() * 1000) + 100,
        user: {
          id: 999, // Current user ID
          name: "John Doe", // Current user name
          username: "johndoe", // Current user username
          avatar: "/placeholder-user.jpg", // Current user avatar
        },
        content: commentText,
        timestamp: "Just now",
        likes: 0,
        hasLiked: false,
        replies: [],
      }

      setComments([newComment, ...comments])
      setCommentText("")
      setIsSubmitting(false)
    }, 500)
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

  const sortedComments = [...comments].sort((a, b) => {
    if (activeTab === "newest") {
      // Simple sort for demo - in a real app, you'd parse the timestamps properly
      return b.id - a.id
    } else if (activeTab === "top") {
      return b.likes - a.likes
    }
    return 0
  })

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader className="border-b border-gray-800 pb-3">
        <CardTitle>Comments ({commentCount})</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-6">
          <div className="flex items-start space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" alt="Your avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
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
                  {isSubmitting ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Tabs defaultValue="newest" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="newest">Newest First</TabsTrigger>
              <TabsTrigger value="top">Top Comments</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {sortedComments.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-800 p-4 text-center">
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedComments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="rounded-lg border border-gray-800 bg-gray-800 p-4">
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
                      <div key={reply.id} className="rounded-lg border border-gray-800 bg-gray-800 p-3">
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
        )}
      </CardContent>
    </Card>
  )
}

