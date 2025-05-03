"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

interface AvatarProps {
  src: string | null
  alt?: string
  className?: string
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }

export function AvatarComponent({ src, alt = "Avatar", className = "" }: AvatarProps) {
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