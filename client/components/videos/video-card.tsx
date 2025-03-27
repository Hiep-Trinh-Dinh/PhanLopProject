"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Pause, Play, MoreHorizontal } from "lucide-react"

interface VideoCardProps {
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

export default function VideoCard({ video }: VideoCardProps) {
  const [mounted, setMounted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(video.likes)
  const [showDropdown, setShowDropdown] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

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
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
      <div className="flex flex-col md:flex-row">
        <div className="relative aspect-video w-full md:w-2/3">
          <Link href={`/video/${video.id}`}>
            <Image src={video.thumbnail || "/placeholder.svg"} alt={video.title} fill className="object-cover" />

            <div className="absolute inset-0 flex items-center justify-center">
              <button
                className="h-16 w-16 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.preventDefault()
                  togglePlay()
                }}
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </button>
            </div>
          </Link>

          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Link href={`/profile/${video.user.username}`}>
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image src={video.user.avatar} alt={video.user.name} fill className="object-cover" />
                </div>
              </Link>
              <div>
                <Link href={`/video/${video.id}`} className="font-semibold text-white hover:underline">
                  <h3>{video.title}</h3>
                </Link>
                <Link href={`/profile/${video.user.username}`} className="text-sm text-gray-400 hover:text-gray-300">
                  {video.user.name}
                </Link>
                <p className="mt-0.5 text-xs text-gray-500">
                  {formatNumber(video.views)} views • {video.createdAt}
                </p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-800"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                  <button className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-800">
                    Save to playlist
                  </button>
                  <button className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-800">
                    Not interested
                  </button>
                  <div className="my-1 h-px bg-gray-800" />
                  <button className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800">
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-300">{video.description}</p>

          <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-4">
            <button
              onClick={toggleLike}
              className={`flex items-center space-x-1 ${isLiked ? "text-red-500" : "text-gray-400"}`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500" : ""}`} />
              <span>{formatNumber(likesCount)}</span>
            </button>

            <Link href={`/video/${video.id}#comments`}>
              <button className="flex items-center space-x-1 text-gray-400 hover:text-white">
                <MessageCircle className="h-5 w-5" />
                <span>{formatNumber(video.comments)}</span>
              </button>
            </Link>

            <button className="flex items-center space-x-1 text-gray-400 hover:text-white">
              <Share2 className="h-5 w-5" />
              <span>{formatNumber(video.shares)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

