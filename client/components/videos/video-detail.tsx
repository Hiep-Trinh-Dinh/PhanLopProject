"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Pause, Play, MoreHorizontal } from "lucide-react"
import VideoComments from "./video-comments"

interface VideoDetailProps {
  video: {
    id: number
    title: string
    description: string
    url: string
    thumbnail: string
    views: number
    likes: number
    comments: number
    shares: number
    createdAt: string
    user: {
      id: number
      name: string
      username: string
      avatar: string
      followers: number
    }
  }
}

export default function VideoDetail({ video }: VideoDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(video.likes)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
        <div className="relative aspect-video w-full">
          <Image src={video.thumbnail || "/placeholder.svg"} alt={video.title} fill className="object-cover" />

          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="h-16 w-16 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </button>
          </div>

          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="p-4">
          <h1 className="text-xl font-bold text-white">{video.title}</h1>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>{formatNumber(video.views)} views</span>
              <span>•</span>
              <span>{video.createdAt}</span>
            </div>

            <div className="flex space-x-2">
              <button
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm ${
                  isLiked ? "text-red-500" : "text-gray-400 hover:bg-gray-800"
                }`}
                onClick={toggleLike}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500" : ""}`} />
                <span>{formatNumber(likesCount)}</span>
              </button>

              <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800">
                <MessageCircle className="h-5 w-5" />
                <span>{formatNumber(video.comments)}</span>
              </button>

              <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800">
                <Share2 className="h-5 w-5" />
                <span>{formatNumber(video.shares)}</span>
              </button>
            </div>
          </div>

          <div className="my-4 h-px bg-gray-800" />

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Link href={`/profile/${video.user.username}`}>
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <img src={video.user.avatar} alt={video.user.name} className="h-full w-full object-cover" />
                </div>
              </Link>
              <div>
                <Link href={`/profile/${video.user.username}`} className="font-semibold text-white hover:underline">
                  {video.user.name}
                </Link>
                <p className="text-xs text-gray-400">{formatNumber(video.user.followers)} followers</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  isFollowing
                    ? "border border-gray-700 text-white hover:bg-gray-800"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                onClick={toggleFollow}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-800"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                    <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                      Save to playlist
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                      Not interested
                    </button>
                    <div className="my-1 h-px bg-gray-800" />
                    <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800">
                      Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="my-4 h-px bg-gray-800" />

          <div className="rounded-lg bg-gray-800 p-4">
            <p className="text-sm text-gray-300">{video.description}</p>
          </div>
        </div>
      </div>

      <VideoComments videoId={video.id} />
    </div>
  )
}

