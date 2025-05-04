"use client"

import { redirect } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import ProfileHeader from "@/components/profile/profile-header"
import ProfileTabs from "@/components/profile/profile-tabs"
import { useUserData } from "@/app/api/auth/me/useUserData"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const { userData, isLoading, error } = useUserData();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Lưu ID người dùng vào localStorage để sử dụng ở các phần khác
    if (userData?.id) {
      localStorage.setItem('currentUserId', userData.id.toString());
    }
  }, [userData]);
  
  // Nếu đang ở phía client và không có dữ liệu người dùng, chuyển hướng đến trang đăng nhập
  if (isClient && !userData && !isLoading) {
    redirect("/");
  }
  
  // Hiển thị loading nếu đang tải dữ liệu
  if (isLoading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-5xl flex justify-center items-center h-96">
          <p className="text-xl">Đang tải thông tin người dùng...</p>
        </div>
      </MainLayout>
    );
  }
  
  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-5xl flex justify-center items-center h-96">
          <p className="text-xl text-red-500">Có lỗi khi tải thông tin: {error.message}</p>
        </div>
      </MainLayout>
    );
  }
  
  // Nếu không có userData (và đang ở phía server hoặc đang loading), trả về null
  if (!userData) {
    return null;
  }
  
  // Chuyển đổi dữ liệu người dùng sang định dạng cần thiết cho ProfileHeader và ProfileTabs
  const currentUser = {
    id: userData.id,
    name: `${userData.firstName} ${userData.lastName}`,
    username: userData.username,
    avatar: userData.image || "/placeholder-user.jpg",
    cover: userData.backgroundImage || "/placeholder.svg",
    bio: userData.bio || "",
    // Thêm các trường khác nếu cần
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl">
        <ProfileHeader user={currentUser} isOwnProfile={true} />
        <ProfileTabs user={currentUser} />
      </div>
    </MainLayout>
  );
}

