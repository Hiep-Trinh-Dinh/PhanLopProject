"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, MoreHorizontal, Share2, ThumbsUp } from "lucide-react"

interface User {
  id: number
  name: string
  avatar: string
  username: string
}

interface Post {
  id: number
  hasLiked: boolean
  user: User
  content: string
  image?: string
  timestamp: string
  likes: number
  comments: number
  shares: number
}

interface PostActionsProps {
  post: Post
  onLike: (id: number) => void
  onComment: (id: number) => void
}

interface CommentSectionProps {
  isActive: boolean
  commentText: string
  onCommentChange: (text: string) => void
  onSubmit: () => void
}

const mockPosts: Post[] = [
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
]

const PostActions = ({ post, onLike, onComment }: PostActionsProps) => (
  <div className="flex border-t border-gray-800 pt-1">
    <button
      className={`flex flex-1 items-center justify-center rounded-md px-3 py-1.5 ${
        post.hasLiked ? "text-blue-500" : "text-gray-400"
      } hover:bg-gray-800`}
      onClick={() => onLike(post.id)}
    >
      {post.hasLiked ? (
        <Heart className="mr-1 h-5 w-5 fill-blue-500" />
      ) : (
        <ThumbsUp className="mr-1 h-5 w-5" />
      )}
      <span>Like</span>
    </button>
    <button
      className="flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-gray-400 hover:bg-gray-800"
      onClick={() => onComment(post.id)}
    >
      <MessageCircle className="mr-1 h-5 w-5" />
      <span>Comment</span>
    </button>
    <button className="flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-gray-400 hover:bg-gray-800">
      <Share2 className="mr-1 h-5 w-5" />
      <span>Share</span>
    </button>
  </div>
)

const CommentSection = ({ isActive, commentText, onCommentChange, onSubmit }: CommentSectionProps) => {
  if (!isActive) return null

  return (
    <div className="mt-3 flex items-start space-x-2">
      <div className="relative h-8 w-8 overflow-hidden rounded-full">
        <Image 
          src="/placeholder-user.jpg" 
          alt="Your avatar"
          width={32}
          height={32}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
          U
        </div>
      </div>
      <div className="flex-1">
        <textarea
          placeholder="Write a comment..."
          className="min-h-[60px] w-full resize-none rounded-md border border-gray-800 bg-gray-800 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={commentText}
          onChange={(e) => onCommentChange(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <button
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={onSubmit}
            disabled={!commentText.trim()}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [commentText, setCommentText] = useState("")
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)
  const [showDropdown, setShowDropdown] = useState<number | null>(null)

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
              hasLiked: !post.hasLiked,
            }
          : post,
      ),
    )
  }

  const handleComment = (postId: number) => {
    setActiveCommentId(activeCommentId === postId ? null : postId)
    setCommentText("")
  }

  const submitComment = (postId: number) => {
    if (!commentText.trim()) return

    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments + 1,
            }
          : post,
      ),
    )
    setCommentText("")
    setActiveCommentId(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="rounded-lg border border-gray-800 bg-gray-900">
          <div className="flex items-start justify-between space-y-0 p-4">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image 
                  src={post.user.avatar || '/placeholder-user.jpg'} 
                  alt={post.user.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                  {post.user.name.charAt(0)}
                </div>
              </div>
              <div>
                <Link href={`/profile/${post.user.username}`} className="font-semibold text-white hover:underline">
                  {post.user.name}
                </Link>
                <p className="text-xs text-gray-400">{post.timestamp}</p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(showDropdown === post.id ? null : post.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showDropdown === post.id && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                    onClick={() => setShowDropdown(null)}
                  >
                    Save Post
                  </button>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                    onClick={() => setShowDropdown(null)}
                  >
                    Report Post
                  </button>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                    onClick={() => setShowDropdown(null)}
                  >
                    Hide Post
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-4 pb-3">
            <Link href={`/post/${post.id}`}>
              <p className="mb-3 text-white">{post.content}</p>
              {post.image && (
                <div className="overflow-hidden rounded-lg">
                  <Image
                    src={post.image}
                    alt="Post image"
                    width={600}
                    height={400}
                    className="h-auto w-full object-cover"
                  />
                </div>
              )}
            </Link>
          </div>

          <div className="flex flex-col border-t border-gray-800 px-4 py-2">
            <div className="flex items-center justify-between py-1 text-sm text-gray-400">
              <div>{post.likes} likes</div>
              <Link href={`/post/${post.id}`} className="hover:underline">
                {post.comments} comments • {post.shares} shares
              </Link>
            </div>

            <PostActions 
              post={post} 
              onLike={handleLike} 
              onComment={handleComment} 
            />

            <CommentSection
              isActive={activeCommentId === post.id}
              commentText={commentText}
              onCommentChange={setCommentText}
              onSubmit={() => submitComment(post.id)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

