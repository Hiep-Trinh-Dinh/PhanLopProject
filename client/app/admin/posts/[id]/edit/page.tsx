"use client";

import React, { useState, useEffect } from "react";
import { AdminPostApi, AdminPostDto } from "../../../../lib/api/admin-post-api";
import { useRouter } from "next/navigation";

interface PostEditProps {
  params: {
    id: string;
  };
}

export default function PostEdit({ params }: PostEditProps) {
  const router = useRouter();
  const [post, setPost] = useState<AdminPostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    privacy: "PUBLIC",
    moderationStatus: "pending",
    moderationReason: "",
  });
  
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
        
        // Initialize form data
        setFormData({
          content: postData.content,
          privacy: postData.privacy,
          moderationStatus: postData.moderationStatus,
          moderationReason: postData.moderationReason || "",
        });
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError(err instanceof Error ? err.message : "An error occurred while fetching post details");
      } finally {
        setLoading(false);
      }
    }
    
    fetchPostDetail();
  }, [params.id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const updatedPost = await AdminPostApi.updatePost(post.id, {
        ...post,
        content: formData.content,
        privacy: formData.privacy,
        moderationStatus: formData.moderationStatus as 'approved' | 'pending' | 'rejected',
        moderationReason: formData.moderationReason,
      });
      
      setPost(updatedPost);
      
      // Navigate back to detail page
      router.push(`/admin/posts/${post.id}`);
    } catch (err) {
      console.error("Failed to update post:", err);
      setError(err instanceof Error ? err.message : "Failed to update post");
    } finally {
      setSaving(false);
    }
  };
  
  const handleLockPost = async () => {
    if (!post) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await AdminPostApi.lockPost(post.id);
      // Navigate back to detail page
      router.push(`/admin/posts/${post.id}`);
    } catch (err) {
      console.error("Failed to lock post:", err);
      setError(err instanceof Error ? err.message : "Failed to lock post");
      setSaving(false);
    }
  };
  
  const handleUnlockPost = async () => {
    if (!post) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await AdminPostApi.unlockPost(post.id);
      // Navigate back to detail page
      router.push(`/admin/posts/${post.id}`);
    } catch (err) {
      console.error("Failed to unlock post:", err);
      setError(err instanceof Error ? err.message : "Failed to unlock post");
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    router.push(`/admin/posts/${params.id}`);
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
  
  if (error && !post) {
    return (
      <div className="bg-red-500 text-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Lỗi</h2>
        <p>{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-white text-red-500 rounded-md hover:bg-gray-100"
          onClick={() => router.push("/admin/posts")}
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
          onClick={() => router.push("/admin/posts")}
        >
          Quay lại
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chỉnh sửa bài viết</h1>
        <button 
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
        >
          Hủy
        </button>
      </div>
      
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 mr-3">
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
              </div>
            </div>
  
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Nội dung
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Quyền riêng tư
              </label>
              <select
                name="privacy"
                value={formData.privacy}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PUBLIC">Công khai</option>
                <option value="FRIENDS">Bạn bè</option>
                <option value="PRIVATE">Riêng tư</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Cài đặt kiểm duyệt</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Trạng thái kiểm duyệt
            </label>
            <select
              name="moderationStatus"
              value={formData.moderationStatus}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Lý do kiểm duyệt (nếu từ chối)
            </label>
            <textarea
              name="moderationReason"
              value={formData.moderationReason}
              onChange={handleChange}
              rows={3}
              placeholder="Nhập lý do nếu từ chối bài viết..."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mt-6 flex items-center">
            <div className="flex items-center text-gray-400 text-sm">
              <span className="mr-2">Trạng thái hiện tại:</span>
              <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                post.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {post.active ? 'Đang hoạt động' : 'Đã vô hiệu'}
              </span>
            </div>
            <div className="ml-auto">
              {post.active ? (
                <button 
                  type="button"
                  onClick={handleLockPost}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-500 text-sm"
                  disabled={saving}
                >
                  Vô hiệu hóa
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handleUnlockPost}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-500 text-sm"
                  disabled={saving}
                >
                  Kích hoạt
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button 
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
            disabled={saving}
          >
            Hủy
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
} 