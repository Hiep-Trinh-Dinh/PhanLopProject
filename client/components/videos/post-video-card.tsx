"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Heart, MessageCircle, Share2, Send } from "lucide-react"
import { PostDto, PostApi } from "@/app/lib/api"
import { useToast } from "@/hooks/use-toast"

interface PostVideoCardProps {
  post: PostDto
}

export default function PostVideoCard({ post: initialPost }: PostVideoCardProps) {
  const [post, setPost] = useState<PostDto>(initialPost)
  const [isLiking, setIsLiking] = useState(false)
  const [isReposting, setIsReposting] = useState(false)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const { toast } = useToast()

  // Lấy API_BASE_URL từ biến môi trường hoặc mặc định
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  
  // Tìm media video trong bài đăng
  const videoMedia = post.media?.find(media => media.mediaType === "VIDEO");
  if (!videoMedia) return null; // Chỉ hiển thị bài đăng có video
  
  // Định dạng thời gian
  const formattedTime = post.createdAt ? 
    formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi }) : 
    "";
  
  // Tạo đường dẫn đầy đủ cho media
  const fullVideoUrl = videoMedia.url.startsWith('http') 
    ? videoMedia.url 
    : `${API_BASE_URL}${videoMedia.url}`;
  
  // Tạo tên hiển thị đầy đủ
  const fullName = `${post.user.firstName || ''} ${post.user.lastName || ''}`.trim();

  // Xử lý like
  const handleLike = async () => {
    try {
      setIsLiking(true)
      
      const updatedPost = post.liked
        ? await PostApi.like.remove(post.id)
        : await PostApi.like.add(post.id)
      
      setPost(updatedPost)
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện hành động này. Vui lòng thử lại sau.",
        variant: "error"
      })
    } finally {
      setIsLiking(false)
    }
  }

  // Xử lý repost (share)
  const handleRepost = async () => {
    try {
      setIsReposting(true)
      
      let updatedPost
      if (post.reposted) {
        updatedPost = await PostApi.unrepost(post.id)
      } else {
        updatedPost = await PostApi.repost(post.id)
      }
      
      setPost(updatedPost)
      
      toast({
        title: post.reposted ? "Đã hủy chia sẻ" : "Đã chia sẻ",
        description: post.reposted
          ? "Bài viết đã được gỡ khỏi trang cá nhân của bạn"
          : "Bài viết đã được chia sẻ lên trang cá nhân của bạn",
      })
    } catch (error) {
      console.error("Error toggling repost:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện hành động này. Vui lòng thử lại sau.",
        variant: "error"
      })
    } finally {
      setIsReposting(false)
    }
  }

  // Xử lý comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!commentText.trim()) return
    
    try {
      setIsSubmittingComment(true)
      
      const newComment = await PostApi.comments.create(post.id, commentText)
      
      // Cập nhật post với comment mới
      setPost(prevPost => ({
        ...prevPost,
        totalComments: prevPost.totalComments + 1,
        previewComments: [newComment, ...(prevPost.previewComments || []).slice(0, 1)]
      }))
      
      setCommentText("")
      // Hiển thị toast thành công
      toast({
        title: "Đã đăng bình luận",
        description: "Bình luận của bạn đã được đăng thành công",
      })
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể đăng bình luận. Vui lòng thử lại sau.",
        variant: "error"
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }
  
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center space-x-3">
        <Link href={`/profile/${post.user.username}`}>
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <img
              src={post.user.image || "/placeholder-user.jpg"}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          </div>
        </Link>
        
        <div>
          <Link href={`/profile/${post.user.username}`} className="font-medium text-white hover:underline">
            {fullName}
          </Link>
          <p className="text-xs text-gray-400">{formattedTime}</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-white mb-3">{post.content}</p>
      </div>
      
      {/* Video */}
      <div className="relative w-full">
        <video
          src={fullVideoUrl}
          controls
          className="w-full max-h-[500px] object-contain bg-black"
          poster="/placeholder.svg"
          preload="metadata"
        />
      </div>
      
      {/* Actions */}
      <div className="p-4 flex items-center justify-between border-t border-gray-800">
        <div className="flex space-x-6">
          <button 
            className="flex items-center space-x-1 text-gray-300 hover:text-white"
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={`h-5 w-5 ${post.liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{post.totalLikes}</span>
          </button>
          
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center space-x-1 text-gray-300 hover:text-white"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.totalComments}</span>
          </button>
          
          <button 
            className="flex items-center space-x-1 text-gray-300 hover:text-white"
            onClick={handleRepost}
            disabled={isReposting}
          >
            <Share2 className={`h-5 w-5 ${post.reposted ? 'text-green-500' : ''}`} />
            <span>{post.totalReposts}</span>
          </button>
        </div>
        
        <Link href={`/post/${post.id}`} className="text-sm text-blue-500 hover:underline">
          Xem chi tiết
        </Link>
      </div>

      {/* Comment Form */}
      {showCommentInput && (
        <div className="p-4 pt-0 border-t border-gray-800">
          <form onSubmit={handleSubmitComment} className="flex items-center space-x-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmittingComment}
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !commentText.trim()}
              className="bg-blue-600 text-white rounded-full p-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Preview comments */}
          {post.previewComments && post.previewComments.length > 0 && (
            <div className="mt-4 space-y-4">
              {post.previewComments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <div className="flex-shrink-0">
                    <Link href={`/profile/${comment.user.username}`}>
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        <img
                          src={comment.user.image || "/placeholder-user.jpg"}
                          alt={`${comment.user.firstName} ${comment.user.lastName}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </Link>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-lg p-2">
                      <Link href={`/profile/${comment.user.username}`} className="font-medium text-white text-sm hover:underline">
                        {comment.user.firstName} {comment.user.lastName}
                      </Link>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                </div>
              ))}
              
              {post.totalComments > post.previewComments.length && (
                <Link href={`/post/${post.id}`} className="block text-center text-sm text-blue-500 hover:underline">
                  Xem tất cả {post.totalComments} bình luận
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 