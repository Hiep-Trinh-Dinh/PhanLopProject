"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminPostApi, AdminPostDto, AdminPostListResponse } from "../../lib/api/admin-post-api";

export default function PostsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [posts, setPosts] = useState<AdminPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Sorting
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await AdminPostApi.getPosts(
        currentPage,
        pageSize,
        searchTerm,
        sortBy,
        sortDir,
        filter
      );
      
      setPosts(response.posts);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, sortBy, sortDir, filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page
    fetchPosts();
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleLockPost = async (postId: number) => {
    try {
      await AdminPostApi.lockPost(postId);
      fetchPosts(); // Refresh list after action
    } catch (err) {
      console.error(`Failed to lock post ${postId}:`, err);
      setError(err instanceof Error ? err.message : "Failed to lock post");
    }
  };

  const handleUnlockPost = async (postId: number) => {
    try {
      await AdminPostApi.unlockPost(postId);
      fetchPosts(); // Refresh list after action
    } catch (err) {
      console.error(`Failed to unlock post ${postId}:`, err);
      setError(err instanceof Error ? err.message : "Failed to unlock post");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-md mb-4">
          {error}
          <button 
            className="ml-4 underline"
            onClick={() => fetchPosts()}
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo nội dung, tác giả..."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã vô hiệu</option>
            </select>
            <select 
              className="px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="id">Sắp xếp theo ID</option>
              <option value="createdAt">Sắp xếp theo ngày tạo</option>
              <option value="likeCount">Sắp xếp theo lượt thích</option>
              <option value="commentCount">Sắp xếp theo lượt bình luận</option>
            </select>
            <select 
              className="px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
            >
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
            </select>
            <button type="submit" className="bg-blue-600 px-4 py-2 text-white rounded-md hover:bg-blue-500">
              Lọc
            </button>
          </div>
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="mt-2 text-white">Đang tải dữ liệu...</p>
          </div>
        ) : posts.length > 0 ? (
          <table className="w-full text-white">
            <thead>
              <tr className="text-left bg-gray-700">
                <th className="p-4">ID</th>
                <th className="p-4">Nội dung</th>
                <th className="p-4">Tác giả</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Tương tác</th>
                <th className="p-4">Báo cáo</th>
                <th className="p-4">Ngày đăng</th>
                <th className="p-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="p-4">{post.id}</td>
                  <td className="p-4">
                    <div className="text-sm text-gray-400 truncate max-w-xs">{post.content}</div>
                    {post.media && post.media.length > 0 && (
                      <div className="mt-1 text-xs text-blue-400">
                        {post.media.length} files đính kèm
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div>{post.userFullName}</div>
                    <div className="text-sm text-gray-400">{post.username}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                      post.active ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                      {post.active ? 'inactive' : 'active'}
                    </span>
                    <div className="mt-1">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                        post.moderationStatus === 'approved' ? 'bg-green-500' : 
                        post.moderationStatus === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}>
                        {post.moderationStatus}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-blue-400 mr-2">❤️ {post.likeCount}</span>
                    <span className="text-green-400">💬 {post.commentCount}</span>
                    <div className="mt-1">
                      <span className="text-yellow-400">🔄 {post.shareCount}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {Number(post.reportCount) > 0 ? (
                      <span className="text-red-400">{post.reportCount} báo cáo</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="p-4">{formatDate(post.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => window.location.href = `/admin/posts/${post.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Xem
                      </button>
                      <button 
                        onClick={() => window.location.href = `/admin/posts/${post.id}/edit`}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        Sửa
                      </button>
                      {post.active ? (
                        <button 
                          onClick={() => handleLockPost(post.id)}
                          className="text-green-400 hover:text-green-300"
                        >
                          Kích hoạt
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUnlockPost(post.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Vô hiệu
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-400">
            Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm
          </div>
        )}

        <div className="bg-gray-700 p-4 flex justify-between items-center">
          <div className="text-white">
            {loading ? (
              'Đang tải...'
            ) : (
              <>
                Hiển thị {posts.length ? (currentPage * pageSize) + 1 : 0}-
                {Math.min((currentPage + 1) * pageSize, totalItems)} 
                trong tổng số {totalItems} bài viết
              </>
            )}
          </div>
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 ${currentPage > 0 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600'} text-white rounded-md disabled:opacity-50`}
              onClick={handlePreviousPage}
              disabled={currentPage === 0 || loading}
            >
              Trước
            </button>
            <span className="px-3 py-1 bg-gray-600 text-white rounded-md">
              {currentPage + 1} / {totalPages || 1}
            </span>
            <button 
              className={`px-3 py-1 ${currentPage < totalPages - 1 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600'} text-white rounded-md disabled:opacity-50`}
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1 || loading}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 