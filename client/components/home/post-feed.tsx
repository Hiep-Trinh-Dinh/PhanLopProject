"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MoreHorizontal, ThumbsUp, Share2 } from "lucide-react";
import { PostApi } from "@/app/lib/api";
import type { PostDto, CommentDto } from "@/app/lib/api";
import { usePostContext } from "@/app/context/post-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

interface PostProps {
  id: number;
  liked: boolean;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    image?: string;
  };
  content: string;
  media: { mediaType: string; url: string }[];
  createdAt: string;
  totalLikes: number;
  totalComments: number;
  previewComments: CommentDto[];
  groupId?: number;
  groupName?: string;
  privacy: string;
}

interface PostActionsProps {
  post: PostProps;
  onLike: (id: number) => void;
  onComment: (id: number) => void;
  onShare: (id: number) => void;
}

interface CommentSectionProps {
  isActive: boolean;
  commentText: string;
  onCommentChange: (text: string) => void;
  onSubmit: () => void;
}

interface PostFeedProps {
  isProfilePage?: boolean;
  userId?: number;
}

const PostActions = memo(({ post, onLike, onComment, onShare }: PostActionsProps) => (
  <div className="flex border-t border-gray-800 pt-1">
    <button
      className={`flex flex-1 items-center justify-center rounded-md px-3 py-1.5 ${
        post.liked ? "text-blue-500" : "text-gray-400"
      } hover:bg-gray-800`}
      onClick={() => onLike(post.id)}
    >
      {post.liked ? (
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
    <button
      className="flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-gray-400 hover:bg-gray-800"
      onClick={() => onShare(post.id)}
    >
      <Share2 className="mr-1 h-5 w-5" />
      <span>Share</span>
    </button>
  </div>
));
PostActions.displayName = "PostActions";

const CommentSection = memo(({ isActive, commentText, onCommentChange, onSubmit }: CommentSectionProps) => {
  if (!isActive) return null;

  return (
    <div className="mt-3 flex items-start space-x-2">
      <div className="h-8 w-8 rounded-full">
        <Image
          src="/placeholder-user.jpg"
          alt="Your avatar"
          width={32}
          height={32}
          sizes="32px"
          className="h-8 w-8 object-cover rounded-full"
          placeholder="blur"
          blurDataURL="/placeholder-user.jpg"
        />
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
  );
});
CommentSection.displayName = "CommentSection";

const Comment = memo(({ comment }: { comment: CommentDto }) => (
  <div className="mt-3 flex items-start space-x-2">
    <div className="h-8 w-8 rounded-full">
      <Image
        src={comment.user.image || "/placeholder-user.jpg"}
        alt={`${comment.user.firstName} ${comment.user.lastName}`}
        width={32}
        height={32}
        className="h-8 w-8 object-cover rounded-full"
        placeholder="blur"
        blurDataURL="/placeholder-user.jpg"
      />
    </div>
    <div className="flex-1 rounded-md bg-gray-800 p-3">
      <Link
        href={`/profile/${comment.user.id}`}
        className="font-semibold text-white hover:underline"
      >
        {comment.user.firstName} {comment.user.lastName}
      </Link>
      <p className="mt-1 text-white">{comment.content}</p>
      <p className="mt-1 text-xs text-gray-400">
        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
      </p>
    </div>
  </div>
));
Comment.displayName = "Comment";

export default function PostFeed({ isProfilePage = false, userId }: PostFeedProps) {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPrivacy, setEditPrivacy] = useState("PUBLIC");
  const { refreshFlag } = usePostContext();

  const currentUserId = typeof window !== 'undefined' 
    ? parseInt(localStorage.getItem('currentUserId') || '0') 
    : 0;

  useEffect(() => {
    console.log(`PostFeed: Received props - isProfilePage=${isProfilePage}, userId=${userId}, currentUserId=${currentUserId}`);
    fetchPosts();
  }, [userId, refreshFlag, isProfilePage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let response;

      if (isProfilePage && userId) {
        console.log(`Fetching posts for user ${userId}`);
        response = await PostApi.getUserPosts(userId, 0, 20);
        console.log("Result:", response.content?.length || 0, "posts");
      } else {
        console.log("Fetching all posts");
        response = await PostApi.getAll(0, 20);
        console.log("Result:", response.content?.length || 0, "posts");
      }

      if (!response.content || response.content.length === 0) {
        setError(isProfilePage ? "Người dùng này chưa có bài viết nào." : "Không có bài viết nào để hiển thị.");
        setPosts([]);
        setLoading(false);
        return;
      }

      const mappedPosts = response.content.map((post: PostDto) => {
        console.log(`Mapping post ${post.id}, user ID: ${post.user.id}`);
        return {
          id: post.id,
          liked: post.liked,
          user: {
            id: post.user.id,
            firstName: post.user.firstName,
            lastName: post.user.lastName,
            username: post.user.username,
            image: post.user.image || "/placeholder-user.jpg",
          },
          content: post.content,
          media: post.media || [],
          createdAt: post.createdAt,
          totalLikes: post.totalLikes,
          totalComments: post.totalComments,
          previewComments: post.previewComments || [],
          groupId: post.groupId || undefined,
          groupName: post.groupName || undefined,
          privacy: post.privacy || "PUBLIC",
        };
      });
      setPosts(mappedPosts);
      if (error) setError(null);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      if (err.message?.includes("Unauthorized")) {
        setError("Vui lòng đăng nhập lại để xem bài viết");
        window.location.href = "/login";
      } else {
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) return;

      const updatedPost = posts[postIndex].liked
        ? await PostApi.like.remove(postId)
        : await PostApi.like.add(postId);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: updatedPost.liked, totalLikes: updatedPost.totalLikes }
            : p
        )
      );
    } catch (err: any) {
      console.error("Like error:", err);
      if (err.message.includes("Unauthorized")) {
        window.location.href = "/login";
      }
    }
  };

  const handleComment = (postId: number) => {
    setActiveCommentId(activeCommentId === postId ? null : postId);
    setCommentText("");
  };

  const submitComment = async (postId: number) => {
    if (!commentText.trim()) return;

    try {
      const newComment = await PostApi.comments.create(postId, commentText);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                totalComments: post.totalComments + 1,
                previewComments: [newComment, ...post.previewComments.slice(0, 2)],
              }
            : post
        )
      );
      setCommentText("");
      setActiveCommentId(null);
    } catch (err: any) {
      console.error("Comment error:", err);
      if (err.message.includes("Unauthorized")) {
        window.location.href = "/login";
      }
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) {
      return;
    }
    
    try {
      await PostApi.delete(postId);
      setPosts((prev) => prev.filter(post => post.id !== postId));
      setShowDropdown(null);
      alert("Đã xóa bài đăng thành công");
    } catch (err: any) {
      console.error("Delete post error:", err);
      alert(err.message || "Không thể xóa bài đăng");
      if (err.message.includes("Unauthorized")) {
        window.location.href = "/login";
      }
    }
  };

  const handleUpdatePost = async (postId: number) => {
    if (!editContent.trim()) {
      alert("Nội dung bài đăng không được để trống");
      return;
    }

    try {
      console.log(`Updating post ${postId} with content: "${editContent}", privacy: "${editPrivacy}"`);
      const updatedPost = await PostApi.update(postId, editContent, editPrivacy);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, content: updatedPost.content, privacy: updatedPost.privacy } : post
        )
      );
      setEditingPostId(null);
      setEditContent("");
      setEditPrivacy("PUBLIC");
      alert("Cập nhật bài đăng thành công");
    } catch (err: any) {
      console.error("Update post error:", err);
      let errorMessage = "Không thể cập nhật bài đăng";
      if (err.message.includes("Unauthorized")) {
        errorMessage = "Vui lòng đăng nhập lại";
        window.location.href = "/login";
      } else if (err.message.includes("permission")) {
        errorMessage = "Bạn không có quyền chỉnh sửa bài đăng này";
      } else if (err.message.includes("Post not found")) {
        errorMessage = "Bài đăng không tồn tại";
      } else if (err.message.includes("Unsupported Media Type")) {
        errorMessage = "Định dạng yêu cầu không được hỗ trợ";
      }
      alert(errorMessage);
    }
  };

  const startEditingPost = (postId: number, currentContent: string, currentPrivacy: string) => {
    setEditingPostId(postId);
    setEditContent(currentContent);
    setEditPrivacy(currentPrivacy);
    setShowDropdown(null);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditContent("");
    setEditPrivacy("PUBLIC");
  };

  const handleShare = async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const shareUrl = `${window.location.origin}/post/${postId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Bài viết của ${post.user.firstName} ${post.user.lastName}`,
          text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Đã sao chép đường dẫn bài viết vào clipboard!');
      }
    } catch (err: any) {
      console.error("Share error:", err);
    }
  };

  if (loading) return (
    <div className="p-4 text-center">
      <div className="animate-pulse flex space-x-2 justify-center">
        <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
        <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
        <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
      </div>
      <div className="mt-2 text-gray-300">Đang tải bài viết...</div>
    </div>
  );
  
  if (error) return (
    <div className="p-4 text-center">
      <div className="rounded-lg border border-red-800 bg-gray-900 p-4 text-red-500">
        <div className="mb-2 font-bold">Đã xảy ra lỗi</div>
        <div>{error}</div>
        <button 
          onClick={fetchPosts} 
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {posts.length === 0 && !loading && !error && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
          {isProfilePage 
            ? `Người dùng này chưa có bài viết nào.${userId ? ` (ID: ${userId})` : ''}` 
            : "Không tìm thấy bài viết nào"}
        </div>
      )}
      
      {posts.map((post) => (
        <div key={post.id} className="rounded-lg border border-gray-800 bg-gray-900">
          <div className="flex items-start justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full">
                <Image
                  src={post.user.image || "/placeholder-user.jpg"}
                  alt={`${post.user.firstName} ${post.user.lastName}`}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                  placeholder="blur"
                  blurDataURL="/placeholder-user.jpg"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/profile/${post.user.id}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {post.user.firstName} {post.user.lastName}
                  </Link>
                  {post.groupName && (
                    <span className="text-sm text-gray-400">
                      Trong nhóm{" "}
                      <Link href={`/groups/${post.groupId}`} className="text-blue-500 hover:underline">
                        {post.groupName}
                      </Link>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  console.log(`Toggling dropdown for post ${post.id}`);
                  setShowDropdown(showDropdown === post.id ? null : post.id);
                }}
                className="rounded-md p-1 hover:bg-gray-800"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              {showDropdown === post.id && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-800 bg-gray-900 shadow-lg">
                  <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                    Save Post
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800">
                    Report Post
                  </button>
                  {currentUserId === post.user.id && (
                    <>
                      <button 
                        className="w-full px-4 py-2 text-left text-sm text-blue-500 hover:bg-gray-800" 
                        onClick={() => startEditingPost(post.id, post.content, post.privacy)}
                      >
                        Update Post
                      </button>
                      <button 
                        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-800" 
                        onClick={() => handleDeletePost(post.id)}
                      >
                        Delete Post
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 pb-3">
            {editingPostId === post.id ? (
              <div className="mb-3">
                <textarea
                  className="w-full resize-none rounded-md border border-gray-800 bg-gray-800 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Chỉnh sửa bài viết..."
                />
                <select
                  className="mt-2 w-full rounded-md border border-gray-800 bg-gray-800 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editPrivacy}
                  onChange={(e) => setEditPrivacy(e.target.value)}
                >
                  <option value="PUBLIC">Công khai</option>
                  <option value="FRIENDS">Bạn bè</option>
                  <option value="PRIVATE">Chỉ mình tôi</option>
                </select>
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    className="rounded-md bg-gray-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
                    onClick={cancelEditing}
                  >
                    Hủy
                  </button>
                  <button
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => handleUpdatePost(post.id)}
                    disabled={!editContent.trim()}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            ) : (
              <p className="mb-3 text-white">{post.content}</p>
            )}
            {post.media && post.media.length > 0 && (
              <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-lg">
                {post.media.map((media, index) => (
                  <div key={index} className="relative">
                    {media.mediaType === "VIDEO" ? (
                      <>
                        <video
                          key={`video-${post.id}-${index}`}
                          src={media.url.startsWith('http') ? media.url : `${API_BASE_URL}${media.url}`}
                          controls
                          className="max-h-[400px] w-full object-contain rounded-lg mx-auto"
                          onError={(e) => {
                            console.error(`Video error:`, { 
                              originalSrc: media.url,
                              fullSrc: media.url.startsWith('http') ? media.url : `${API_BASE_URL}${media.url}`,
                              error: e 
                            });
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </>
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
                          console.error(`Image error: ${media.url}`);
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 px-4 py-2">
            <div className="flex items-center justify-between py-1 text-sm text-gray-400">
              <div>{post.totalLikes} likes</div>
              <div>
                <Link href={`/post/${post.id}`} className="hover:underline">
                  {post.totalComments} comments
                </Link>
              </div>
            </div>

            <PostActions
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
            />

            {post.previewComments.length > 0 && (
              <div className="mt-3">
                {post.previewComments.map((comment) => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </div>
            )}

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
  );
}