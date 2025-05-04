"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import ProfileHeader from "@/components/profile/profile-header"
import ProfileTabs from "@/components/profile/profile-tabs"
import { ProfileApi } from "@/app/lib/api"

// Interface cho dữ liệu user nhận từ API
interface UserProfile {
  id: number;
  username?: string;
  firstName: string;
  lastName: string;
  email?: string;
  bio?: string;
  image?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  createdAt?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  isFriend?: boolean;
  pendingFriendRequest?: boolean;
  receivedFriendRequest?: boolean;
  isTemporaryData?: boolean;
}

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Đặt trang về trạng thái loading
        setLoading(true);
        setError(null);
        
        // Lấy username từ params và xử lý để đúng định dạng
        const usernameParam = decodeURIComponent(params.username);
        console.log("Đang tải profile cho username:", usernameParam);
        
        try {
          // Gọi API để lấy thông tin user theo username
          const userData = await ProfileApi.getUserProfileByUsername(usernameParam);
          console.log("Đã lấy thông tin user:", userData);
          
          // Sau khi lấy thông tin cơ bản, lấy thêm thông tin về trạng thái bạn bè
          const userWithFriendship = await ProfileApi.getUserProfileWithFriendship(userData.id);
          setUser(userWithFriendship);
        } catch (apiError: any) {
          // Nếu không tìm thấy username, thử tìm kiếm qua API search
          if (apiError.message?.includes('404') || apiError.message?.includes('Not Found')) {
            const searchResponse = await fetch(`/api/users/search?q=${usernameParam}`, {
              method: 'GET',
              credentials: 'include'
            });
            
            if (!searchResponse.ok) {
              return notFound();
            }
            
            const searchResults = await searchResponse.json();
            if (searchResults && Array.isArray(searchResults.content) && searchResults.content.length > 0) {
              // Nếu tìm thấy user, lấy ID và chuyển hướng đến endpoint lấy profile theo ID
              const foundUser = searchResults.content[0];
              router.push(`/profile/id/${foundUser.id}`);
              return;
            } else {
              return notFound();
            }
          } else {
            throw apiError;
          }
        }
      } catch (err: any) {
        console.error("Lỗi khi lấy thông tin user:", err);
        setError(err.message);
        
        if (err.message.includes("Unauthorized") || err.message.includes("403")) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
        setIsRetrying(false);
      }
    };
    
    fetchProfile();
  }, [params.username, router, isRetrying]);

  const handleRetry = () => {
    setIsRetrying(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-white flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div>Đang tải thông tin người dùng...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen flex-col">
          <div className="text-red-500 mb-4 max-w-lg text-center">
            {error?.includes("Redis cache") 
              ? (
                <>
                  <h3 className="text-xl font-bold mb-2">Lỗi server</h3>
                  <p>Máy chủ đang gặp vấn đề với Redis cache. Đây là lỗi từ phía máy chủ, không phải lỗi ứng dụng.</p>
                  <p className="mt-2">Thông tin chi tiết: {error}</p>
                </>
              ) 
              : (error || 'Không thể tải thông tin người dùng')}
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Thử lại
            </button>
            <button 
              onClick={() => router.push('/home')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Kiểm tra xem có phải profile của user hiện tại không
  const isOwnProfile = ProfileApi.isCurrentUserProfile(user.id);
  
  // Kiểm tra xem dữ liệu có phải tạm thời không
  const isTemporaryData = 'isTemporaryData' in user && user.isTemporaryData === true;

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl">
        {isTemporaryData && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <div className="flex items-center">
              <div className="py-1">
                <svg className="h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Đang hiển thị dữ liệu tạm thời</p>
                <p className="text-sm">Server đang gặp sự cố về Redis cache. Thông tin hiển thị có thể không chính xác.</p>
              </div>
            </div>
            <div className="mt-3">
              <button 
                onClick={handleRetry} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Thử tải lại dữ liệu
              </button>
            </div>
          </div>
        )}
        
        <ProfileHeader 
          user={{
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            username: user.username || `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`,
            avatar: user.image || "/placeholder-user.jpg",
            cover: user.coverImage || "/placeholder.svg",
            bio: user.bio || ""
          }} 
          isOwnProfile={isOwnProfile}
          friendStatus={{
            isFriend: user.isFriend || false,
            isPending: user.pendingFriendRequest || false,
            isReceived: user.receivedFriendRequest || false
          }}
        />
        <ProfileTabs 
          user={{
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            username: user.username || `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`
          }} 
        />
      </div>
    </MainLayout>
  )
}

