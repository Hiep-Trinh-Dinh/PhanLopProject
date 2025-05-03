"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { PostDto, PostApi } from "@/app/lib/api"
import PostVideoCard from "./post-video-card"

export default function VideoFeed() {
  const [videos, setVideos] = useState<PostDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)
  
  const lastVideoElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreVideos()
      }
    }, { threshold: 0.5 })
    
    if (node) observer.current.observe(node)
  }, [isLoading, hasMore])

  const fetchVideoPosts = async () => {
    try {
      setIsLoading(true)
      const response = await PostApi.getAll(0, 20) // Lấy số lượng bài đăng
      
      // Lọc các bài đăng có video
      const postsWithVideos = response.content.filter(post => 
        post.media && post.media.some(media => media.mediaType === "VIDEO")
      )
      
      setVideos(postsWithVideos)
      setHasMore(postsWithVideos.length > 0)
      setError(null)
    } catch (err) {
      console.error("Không thể tải bài đăng video:", err)
      setError("Không thể tải nội dung. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVideoPosts()
  }, [])

  const loadMoreVideos = async () => {
    try {
      if (!hasMore || isLoading) return
      
      setIsLoading(true)
      const nextPage = page + 1
      setPage(nextPage)
      
      const response = await PostApi.getAll(nextPage, 10)
      
      // Lọc các bài đăng có video
      const newPostsWithVideos = response.content.filter(post => 
        post.media && post.media.some(media => media.mediaType === "VIDEO")
      )
      
      // Lọc ra các bài đăng không trùng lặp
      const newUniqueVideos = newPostsWithVideos.filter(
        newPost => !videos.some(existingPost => existingPost.id === newPost.id)
      )
      
      setVideos(prevVideos => [...prevVideos, ...newUniqueVideos])
      setHasMore(newUniqueVideos.length > 0)
    } catch (err) {
      console.error("Không thể tải thêm bài đăng video:", err)
      setError("Không thể tải thêm nội dung. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Bài đăng có video</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {videos.length === 0 && !isLoading && !error ? (
          <div className="text-center py-10 text-gray-400">
            <p>Chưa có bài đăng video nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {videos.map((post, index) => (
              <div
                key={post.id}
                ref={index === videos.length - 1 ? lastVideoElementRef : undefined}
              >
                <PostVideoCard post={post} />
              </div>
            ))}
            
            {isLoading && (
              <div className="py-4 text-center text-gray-400">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" />
                <p className="mt-2">Đang tải...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

