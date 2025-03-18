"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Pause, Play, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(video.likes)
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
    <Card className="overflow-hidden border-gray-800 bg-gray-900">
      <div className="flex flex-col md:flex-row">
        <div className="relative aspect-video w-full md:w-2/3">
          <Link href={`/video/${video.id}`}>
            {/* For demo purposes, using an image instead of video */}
            <Image src={video.thumbnail || "/placeholder.svg"} alt={video.title} fill className="object-cover" />

            {/* This would be a real video in a production app */}
            {/* <video
            ref={videoRef}
            src={video.url}
            poster={video.thumbnail}
            className="h-full w-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onClick={togglePlay}
          /> */}

            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.preventDefault()
                  togglePlay()
                }}
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
            </div>
          </Link>

          <div className="absolute bottom-4 right-4 flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Link href={`/profile/${video.user.username}`}>
                <Avatar>
                  <AvatarImage src={video.user.avatar} alt={video.user.name} />
                  <AvatarFallback>{video.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-gray-800 bg-gray-900 text-white">
                <DropdownMenuItem className="cursor-pointer">Save to playlist</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Not interested</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem className="cursor-pointer text-red-400">Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mt-3 text-sm text-gray-300">{video.description}</p>

          <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isLiked ? "text-red-500" : "text-gray-400"}`}
              onClick={toggleLike}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500" : ""}`} />
              <span>{formatNumber(likesCount)}</span>
            </Button>

            <Link href={`/video/${video.id}#comments`}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-400">
                <MessageCircle className="h-5 w-5" />
                <span>{formatNumber(video.comments)}</span>
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-400">
              <Share2 className="h-5 w-5" />
              <span>{formatNumber(video.shares)}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

