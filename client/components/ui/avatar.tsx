"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface AvatarProps {
  src: string | null
  alt?: string
  className?: string
}

export function Avatar({ src, alt = "Avatar", className = "" }: AvatarProps) {
  const [mounted, setMounted] = useState(false)
  const [imgSrc, setImgSrc] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    if (src && typeof src === "string" && src.trim() !== "") {
      setImgSrc(src)
    } else {
      setImgSrc(null)
    }
  }, [src])

  // Luôn render placeholder ở server
  if (typeof window === 'undefined') {
    return (
      <div className={`relative overflow-hidden rounded-full ${className}`}>
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-2xl">?</span>
        </div>
      </div>
    )
  }

  // Render placeholder khi chưa mounted
  if (!mounted) {
    return (
      <div className={`relative overflow-hidden rounded-full ${className}`}>
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-2xl">?</span>
        </div>
      </div>
    )
  }

  // Render placeholder khi không có src
  if (!imgSrc) {
    return (
      <div className={`relative overflow-hidden rounded-full ${className}`}>
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-2xl">?</span>
        </div>
      </div>
    )
  }

  // Render Image khi đã mounted và có src
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setImgSrc(null)}
        priority
      />
    </div>
  )
} 