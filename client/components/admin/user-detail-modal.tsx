"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  XCircle,
  MapPin,
  Clock,
  UserCheck,
  MessageSquare
} from "lucide-react";
import { AdminUserApi, type AdminUserDto } from "@/app/lib/api/admin-user-api";
import { formatDate, formatDateTime, formatTimeAgo } from "@/utils/format-utils";

interface UserDetailModalProps {
  userId: number;
  onClose: () => void;
}

export default function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const [userData, setUserData] = useState<AdminUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await AdminUserApi.getUserDetail(userId);
        setUserData(data);
      } catch (error) {
        console.error(`Lỗi khi lấy thông tin người dùng ID ${userId}:`, error);
        setError(error instanceof Error ? error.message : "Không thể tải thông tin người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-white">Thông tin chi tiết người dùng</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="text-gray-400">Đang tải thông tin...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-60">
              <div className="text-red-500">{error}</div>
            </div>
          ) : userData ? (
            <div className="space-y-6">
              {/* User header */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                  <Image
                    src={userData.image || "/placeholder-user.jpg"}
                    alt={userData.username}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-bold text-white">{userData.firstName} {userData.lastName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                    userData.role === 'admin' ? 'bg-purple-500' : 
                    userData.role === 'moderator' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {userData.role}
                  </span>
                  <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                    userData.status === 'active' ? 'bg-green-500' : 
                    userData.status === 'locked' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {userData.status === 'active' ? 'Hoạt động' : 
                     userData.status === 'locked' ? 'Đã khóa' : 'Chờ duyệt'}
                  </span>
                </div>
              </div>
              
              {/* User info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-md">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <Mail size={16} />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-white">{userData.email}</p>
                  {userData.isEmailVerified ? (
                    <div className="mt-1 flex items-center gap-1 text-green-400 text-xs">
                      <CheckCircle size={12} />
                      <span>Đã xác thực</span>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-1 text-yellow-400 text-xs">
                      <XCircle size={12} />
                      <span>Chưa xác thực</span>
                    </div>
                  )}
                </div>
                
                {userData.phone && (
                  <div className="bg-gray-700/50 p-4 rounded-md">
                    <div className="flex items-center gap-2 text-gray-300 mb-2">
                      <Phone size={16} />
                      <span className="font-medium">Số điện thoại</span>
                    </div>
                    <p className="text-white">{userData.phone}</p>
                  </div>
                )}
                
                <div className="bg-gray-700/50 p-4 rounded-md">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <UserCheck size={16} />
                    <span className="font-medium">Bạn bè</span>
                  </div>
                  <p className="text-white">{userData.friendsCount || 0}</p>
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-md">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <MessageSquare size={16} />
                    <span className="font-medium">Bài viết</span>
                  </div>
                  <p className="text-white">{userData.postsCount || 0}</p>
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-md">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <Calendar size={16} />
                    <span className="font-medium">Ngày tạo tài khoản</span>
                  </div>
                  <p className="text-white">{formatDate(userData.createdAt)}</p>
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-md">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <Clock size={16} />
                    <span className="font-medium">Hoạt động gần đây</span>
                  </div>
                  <p className="text-white">
                    {userData.lastSeen 
                      ? formatTimeAgo(userData.lastSeen)
                      : 'Chưa có thông tin'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-60">
              <div className="text-red-500">Không tìm thấy thông tin người dùng</div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
} 