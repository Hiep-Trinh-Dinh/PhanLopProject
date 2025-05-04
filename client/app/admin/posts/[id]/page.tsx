"use client";

import React, { useState, useEffect } from "react";
import { AdminPostApi, AdminPostDto } from "../../../lib/api/admin-post-api";
import { useRouter } from "next/navigation";

interface PostDetailProps {
  params: {
    id: string;
  };
}

export default function PostDetail({ params }: PostDetailProps) {
  const router = useRouter();
  const [post, setPost] = useState<AdminPostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchPostDetail() {
      setLoading(true);
      try {
        const postId = parseInt(params.id);
        if (isNaN(postId)) {
          throw new Error("Invalid post ID");
        }
        
        const postData = await AdminPostApi.getPostById(postId);
        setPost(postData);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError(err instanceof Error ? err.message : "An error occurred while fetching post details");
      } finally {
        setLoading(false);
      }
    }
    
    fetchPostDetail();
  }, [params.id]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleLockPost = async () => {
    if (!post) return;
    
    try {
      await AdminPostApi.lockPost(post.id);
      // Refresh post data
      const updatedPost = await AdminPostApi.getPostById(post.id);
      setPost(updatedPost);
    } catch (err) {
      console.error("Failed to lock post:", err);
      setError(err instanceof Error ? err.message : "Failed to lock post");
    }
  };
  
  const handleUnlockPost = async () => {
    if (!post) return;
    
    try {
      await AdminPostApi.unlockPost(post.id);
      // Refresh post data
      const updatedPost = await AdminPostApi.getPostById(post.id);
      setPost(updatedPost);
    } catch (err) {
      console.error("Failed to unlock post:", err);
      setError(err instanceof Error ? err.message : "Failed to unlock post");
    }
  };
  
  const handleGoBack = () => {
    router.back();
  };
  
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-2 text-white">Đang tải thông tin bài viết...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-500 text-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Lỗi</h2>
        <p>{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-white text-red-500 rounded-md hover:bg-gray-100"
          onClick={handleGoBack}
        >
          Quay lại
        </button>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Không tìm thấy bài viết</h2>
        <p>Bài viết này không tồn tại hoặc đã bị xóa.</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          onClick={handleGoBack}
        >
          Quay lại
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chi tiết bài viết</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
          >
            Quay lại
          </button>
          <button 
            onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-500"
          >
            Chỉnh sửa
          </button>
          {post.active ? (
            <button 
              onClick={handleLockPost}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
            >
              Vô hiệu hóa
            </button>
          ) : (
            <button 
              onClick={handleUnlockPost}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
            >
              Kích hoạt
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="mb-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-700 mr-4">
              {post.userProfilePicture ? (
                <img 
                  src={post.userProfilePicture} 
                  alt={post.userFullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  👤
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium">{post.userFullName}</h3>
              <div className="text-sm text-gray-400">@{post.username}</div>
              <div className="text-xs text-gray-500 mt-1">{formatDate(post.createdAt)}</div>
            </div>
            <div className="ml-auto">
              <span className={`inline-block rounded-full px-3 py-1 text-xs ${
                post.active ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {post.active ? 'Active' : 'Inactive'}
              </span>
              <span className={`ml-2 inline-block rounded-full px-3 py-1 text-xs ${
                post.moderationStatus === 'approved' ? 'bg-green-500' : 
                post.moderationStatus === 'pending' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                {post.moderationStatus}
              </span>
            </div>
          </div>
          
          <div className="mb-6 text-gray-300 whitespace-pre-wrap">
            {post.content}
          </div>
          
          {post.media && post.media.length > 0 && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {post.media.map(media => (
                <div key={media.id} className="bg-gray-900 rounded-lg overflow-hidden">
                  {media.mediaType === 'IMAGE' ? (
                    <img 
                      src={media.url} 
                      alt="Post media" 
                      className="w-full h-auto object-contain"
                    />
                  ) : media.mediaType === 'VIDEO' ? (
                    <video 
                      src={media.url} 
                      controls
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Unsupported media type: {media.mediaType}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-6 text-sm border-t border-gray-700 pt-4">
            <div className="text-blue-400">
              <span className="mr-1">❤️</span>
              {post.likeCount} lượt thích
            </div>
            <div className="text-green-400">
              <span className="mr-1">💬</span>
              {post.commentCount} bình luận
            </div>
            <div className="text-yellow-400">
              <span className="mr-1">🔄</span>
              {post.shareCount} chia sẻ
            </div>
            {Number(post.reportCount) > 0 && (
              <div className="text-red-400">
                <span className="mr-1">🚩</span>
                {post.reportCount} báo cáo
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="mb-4">
              <div className="text-gray-400 mb-1">ID</div>
              <div>{post.id}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-400 mb-1">Quyền riêng tư</div>
              <div className="capitalize">{post.privacy.toLowerCase()}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-400 mb-1">Trạng thái</div>
              <div className="capitalize">{post.active ? 'Đang hoạt động' : 'Đã vô hiệu'}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-400 mb-1">Tác giả</div>
              <div>
                {post.userFullName} (@{post.username})
                <div className="text-xs text-gray-500">ID: {post.userId}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <div className="text-gray-400 mb-1">Ngày tạo</div>
              <div>{formatDate(post.createdAt)}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-400 mb-1">Cập nhật lần cuối</div>
              <div>{formatDate(post.updatedAt)}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-400 mb-1">Trạng thái kiểm duyệt</div>
              <div className="capitalize">{post.moderationStatus}</div>
            </div>
            {post.moderationReason && (
              <div className="mb-4">
                <div className="text-gray-400 mb-1">Lý do kiểm duyệt</div>
                <div>{post.moderationReason}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button 
          onClick={handleGoBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
        >
          Quay lại
        </button>
        {post.active ? (
          <button 
            onClick={handleLockPost}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
          >
            Vô hiệu hóa
          </button>
        ) : (
          <button 
            onClick={handleUnlockPost}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
          >
            Kích hoạt
          </button>
        )}
      </div>
    </div>
  );
} 