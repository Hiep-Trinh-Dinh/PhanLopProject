"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import ProfileHeader from "@/components/profile/profile-header"
import ProfileTabs from "@/components/profile/profile-tabs"

// Định nghĩa URL API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Interface cho dữ liệu user nhận từ API
interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  bio?: string;
  image?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export default function UserProfileByIdPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lấy ID của user hiện tại từ localStorage để kiểm tra xem có phải profile của mình không
  const currentUserId = typeof window !== 'undefined' 
    ? parseInt(localStorage.getItem('currentUserId') || '0', 10) 
    : 0;

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Lấy userId từ params
      const userId = parseInt(params.id, 10);
      if (isNaN(userId)) {
        throw new Error("ID người dùng không hợp lệ");
      }
      
      console.log("Đang tải profile cho userId:", userId);
      
      // Gọi API lấy thông tin user theo ID
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'GET',
        credentials: 'include', // Gửi cookie xác thực
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.error("Không tìm thấy người dùng với ID:", userId);
          return notFound();
        }
        if (response.status === 403) {
          throw new Error("Bạn không có quyền xem profile này");
        }
        if (response.status === 500) {
          throw new Error("Lỗi server: Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
        }
        throw new Error(`Lỗi khi lấy thông tin user: ${response.statusText}`);
      }
      
      const userData = await response.json();
      console.log("Đã lấy thông tin user:", userData);
      setUser(userData);
    } catch (err: any) {
      console.error("Lỗi khi lấy thông tin user:", err);
      setError(err.message);
      
      if (err.message.includes("Unauthorized") || err.message.includes("403")) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {    
    fetchUserProfile();
  }, [params.id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-white">Đang tải thông tin người dùng...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen flex-col">
          <div className="text-red-500 mb-4">{error || 'Không thể tải thông tin người dùng'}</div>
          <button 
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchUserProfile();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Thử lại
          </button>
        </div>
      </MainLayout>
    );
  }

  // Kiểm tra xem có phải profile của user hiện tại không
  const isOwnProfile = user.id === currentUserId;

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl">
        <ProfileHeader 
          user={{
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            username: `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`,
            avatar: user.image || "/placeholder-user.jpg",
            cover: user.coverImage || "/placeholder.svg",
            bio: user.bio || ""
          }} 
          isOwnProfile={isOwnProfile}
        />
        <ProfileTabs 
          user={{
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            username: `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`
          }} 
        />
      </div>
    </MainLayout>
  )
} 