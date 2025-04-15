"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MoreHorizontal, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PostApi } from "@/app/lib/api";
import type { CommentDto } from "@/app/lib/api";

interface CommentListProps {
  postId: number;
}

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const fetchedComments = await PostApi.comments.getByPostId(postId);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleLikeComment = async (commentId: number) => {
    try {
      const commentIndex = comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return;

      const updatedComments = [...comments];
      const comment = updatedComments[commentIndex];
      
      // Optimistic update
      const wasLiked = comment.liked;
      updatedComments[commentIndex] = {
        ...comment,
        liked: !wasLiked,
        totalLikes: wasLiked ? comment.totalLikes - 1 : comment.totalLikes + 1
      };
      setComments(updatedComments);

      // API call
      if (wasLiked) {
      } else {
      }
    } catch (error) {
      console.error("Like comment error:", error);
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Reply error:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Loading comments...</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
        <p className="text-gray-400">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">Comments ({comments.length})</h3>

      {comments.map((comment) => (
        <div key={comment.id} className="space-y-3">
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full">
                <Image
                  src={comment.user.image || "/placeholder-user.jpg"}
                  alt={`${comment.user.firstName} ${comment.user.lastName}`}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                  onError={(e) => {
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/profile/${comment.user.username}`}
                      className="font-semibold text-white hover:underline"
                    >
                      {comment.user.firstName} {comment.user.lastName}
                    </Link>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(showDropdown === comment.id ? null : comment.id)}
                      className="rounded-md p-1 hover:bg-gray-800"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {showDropdown === comment.id && (
                      <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border border-gray-800 bg-gray-900 shadow-lg">
                        <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                          Report Comment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                  <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                  <button
                    className={`flex items-center space-x-1 ${comment.liked ? "text-blue-500" : "text-gray-400"}`}
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    <Heart className={`h-4 w-4 ${comment.liked ? "fill-blue-500" : ""}`} />
                    <span>{comment.totalLikes} Likes</span>
                  </button>
                  <button
                    className="flex items-center space-x-1 text-gray-400"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {replyingTo === comment.id && (
            <div className="ml-10 flex items-start space-x-2">
              <div className="h-7 w-7 rounded-full">
                <Image
                  src="/placeholder-user.jpg"
                  alt="Your avatar"
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <textarea
                  placeholder={`Reply to ${comment.user.firstName}...`}
                  className="min-h-[60px] w-full resize-none rounded-md border border-gray-800 bg-gray-800 p-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    className="rounded-md border border-gray-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyText.trim() || isSubmittingReply}
                  >
                    {isSubmittingReply ? "Posting..." : "Reply"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}