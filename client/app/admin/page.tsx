"use client";

import React, { useState, useEffect } from "react";
import { AdminUserApi, AdminUserDto } from "../lib/api/admin-user-api";
import { AdminPostApi, AdminPostDto } from "../lib/api/admin-post-api";

export default function AdminDashboard() {
  // State cho dữ liệu thống kê
  const [stats, setStats] = useState([
    { title: "Tổng người dùng", value: "...", change: "...", icon: "👥" },
    { title: "Bài viết mới", value: "...", change: "...", icon: "📝" },
  ]);

  // State cho danh sách người dùng và bài viết gần đây
  const [recentUsers, setRecentUsers] = useState<AdminUserDto[]>([]);
  const [recentPosts, setRecentPosts] = useState<AdminPostDto[]>([]);
  
  // State loading và error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Lấy dữ liệu người dùng
        const usersData = await AdminUserApi.getUsers(0, 5, "", "createdAt", "desc", "all");
        setRecentUsers(usersData.users);
        
        // Lấy dữ liệu bài viết
        const postsData = await AdminPostApi.getPosts(0, 5, "", "createdAt", "desc", "all");
        setRecentPosts(postsData.posts);
        
        // Cập nhật stats
        setStats([
          { 
            title: "Tổng người dùng", 
            value: usersData.totalItems.toString(), 
            change: "+", 
            icon: "👥" 
          },
          { 
            title: "Bài viết mới", 
            value: postsData.totalItems.toString(), 
            change: "+", 
            icon: "📝" 
          }
        ]);
        
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-md mb-6">
          {error}
          <button 
            className="ml-4 underline"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-sm text-green-400">
                {loading ? "..." : stat.change}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-semibold">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                stat.value
              )}
            </p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-700 p-4 font-semibold text-white">
            Người dùng gần đây
          </div>
          {loading ? (
            <div className="p-8 text-center text-white">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Đang tải...
                </span>
              </div>
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : recentUsers.length > 0 ? (
            <table className="w-full text-white">
              <thead>
                <tr className="text-left bg-gray-700">
                  <th className="p-4">ID</th>
                  <th className="p-4">Tên</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700">
                    <td className="p-4">{user.id}</td>
                    <td className="p-4">{user.firstName} {user.lastName}</td>
                    <td className="p-4">@{user.username}</td>
                    <td className="p-4">
                      <span 
                        className={`inline-block rounded-full px-2 py-1 text-xs 
                          ${user.status === 'active' ? 'bg-green-500' : 
                            user.status === 'locked' ? 'bg-red-500' : 
                            'bg-yellow-500'}`}
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-400">
              Không có dữ liệu người dùng
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-700 p-4 font-semibold text-white">
            Bài viết gần đây
          </div>
          {loading ? (
            <div className="p-8 text-center text-white">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Đang tải...
                </span>
              </div>
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : recentPosts.length > 0 ? (
            <table className="w-full text-white">
              <thead>
                <tr className="text-left bg-gray-700">
                  <th className="p-4">ID</th>
                  <th className="p-4">Nội dung</th>
                  <th className="p-4">Người đăng</th>
                  <th className="p-4">Tương tác</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={post.id} className="border-t border-gray-700 hover:bg-gray-700">
                    <td className="p-4">{post.id}</td>
                    <td className="p-4 max-w-[200px] truncate">{post.content}</td>
                    <td className="p-4">{post.userFullName}</td>
                    <td className="p-4">
                      <span className="text-blue-400 mr-2">❤️ {post.likeCount}</span>
                      <span className="text-green-400">💬 {post.commentCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-400">
              Không có dữ liệu bài viết
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 