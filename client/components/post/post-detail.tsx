"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, MoreHorizontal, Share2, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PostApi } from "@/app/lib/api";
import type { PostDto } from "@/app/lib/api";
import CommentList from "./comment-list";
import { useRouter } from "next/navigation";

interface PostDetailProps {
  post: PostDto;
}

export default function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLiked, setIsLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.totalLikes);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.totalComments);
  const [reposted, setReposted] = useState(post.reposted);
  const [totalReposts, setTotalReposts] = useState(post.totalReposts);

  // Kiểm tra xem user hiện tại có phải là người tạo bài viết không
  const isCurrentUserPost = post.user.id === parseInt(localStorage.getItem('currentUserId') || '0');

  const handleLike = async () => {
    try {
      const updatedPost = isLiked 
        ? await PostApi.like.remove(post.id)
        : await PostApi.like.add(post.id);
      
      setIsLiked(updatedPost.liked);
      setLikesCount(updatedPost.totalLikes);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleRepost = async () => {
    try {
      const updatedPost = await PostApi.repost(post.id);
      setReposted(updatedPost.reposted);
      setTotalReposts(updatedPost.totalReposts);
    } catch (error) {
      console.error("Error toggling repost:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await PostApi.comments.create(post.id, commentText);
      setCommentText("");
      setCommentsCount(prev => prev + 1);
      router.refresh();
    } catch (error) {
      console.error("Comment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) {
      return;
    }
    
    try {
      await PostApi.delete(post.id);
      
      // Thông báo xóa thành công
      alert("Đã xóa bài đăng thành công");
      
      // Chuyển hướng về trang chủ
      router.push('/home');
    } catch (err: any) {
      console.error("Delete post error:", err);
      alert(err.message || "Không thể xóa bài đăng");
      
      if (err.message.includes("Unauthorized")) {
        router.push('/login');
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        {/* Post header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full">
                <Image
                  src={post.user.image || "/placeholder-user.jpg"}
                  alt={`${post.user.firstName} ${post.user.lastName}`}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => {
                  }}
                />
              </div>
              <div>
                <Link
                  href={`/profile/${post.user.username}`}
                  className="font-semibold text-white hover:underline"
                >
                  {post.user.firstName} {post.user.lastName}
                </Link>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="rounded-md p-1 hover:bg-gray-800"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-800 bg-gray-900 shadow-lg">
                  <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                    Save Post
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                    Report Post
                  </button>
                  {isCurrentUserPost && (
                    <button 
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-800"
                      onClick={handleDeletePost}
                    >
                      Delete Post
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Post content */}
          <div className="mt-4">
            <p className="text-white">{post.content}</p>
            {post.media && post.media.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2 overflow-hidden rounded-lg">
                {post.media.map((media, index) => (
                  <div key={index} className="relative">
                    {media.mediaType === "VIDEO" ? (
                      <video
                        src={media.url}
                        controls
                        className="max-h-[500px] w-full object-contain rounded-lg mx-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Image
                        src={media.url}
                        alt={`Post media ${index + 1}`}
                        width={600}
                        height={400}
                        className="h-auto w-full object-cover rounded-lg"
                        placeholder="blur"
                        blurDataURL="/placeholder-user.jpg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Post stats */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-4 text-sm">
            <div className="flex space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 ${isLiked ? "text-blue-500" : "text-gray-400"}`}
              >
                {isLiked ? (
                  <Heart className="h-5 w-5 fill-blue-500" />
                ) : (
                  <ThumbsUp className="h-5 w-5" />
                )}
                <span>{likesCount} Likes</span>
              </button>
              <div className="flex items-center space-x-1 text-gray-400">
                <MessageCircle className="h-5 w-5" />
                <span>{commentsCount} Comments</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-400">
                <Share2 className="h-5 w-5" />
                <span>{totalReposts} Shares</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comment form */}
        <div className="border-t border-gray-800 p-4">
          <form onSubmit={handleSubmitComment} className="flex items-start space-x-2">
            <div className="h-8 w-8 rounded-full">
              <Image
                src="/placeholder-user.jpg"
                alt="Your avatar"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Write a comment..."
                className="min-h-[60px] w-full resize-none rounded-md border border-gray-800 bg-gray-800 p-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={!commentText.trim() || isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Comments list */}
        <div className="border-t border-gray-800 p-4">
          <CommentList postId={post.id} />
        </div>
      </div>
    </div>
  );
}