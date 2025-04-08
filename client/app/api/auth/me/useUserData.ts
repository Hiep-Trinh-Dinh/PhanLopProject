import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { useEffect } from "react";

// Định nghĩa interface cho dữ liệu người dùng
interface UserData {
  id: number;
  workExperiences?: any[];
  educations?: any[];
  email_contact?: string;
  phone_contact?: string;
  website?: string;
  currentCity?: string;
  image: string;
  backgroundImage?: string;
  bio: string;
  hometown?: string;
  updatedAt?: string;
  firstName: string;
  lastName: string;
  username: string;
  friendsCount?: number;
  mutualFriends?: number;
  isCurrentUser?: boolean;
  isFriend?: boolean;
  relationshipStatus?: "SINGLE" | "IN_RELATIONSHIP" | "MARRIED" | "COMPLICATED" | null;
}

// Zustand store để quản lý dữ liệu người dùng toàn cục
interface UserStore {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
}

const useUserStore = create<UserStore>((set) => ({
  userData: null,
  setUserData: (data) => set({ userData: data }),
}));

// Hàm gọi API lấy dữ liệu người dùng
const fetchUserData = async (userId: number): Promise<UserData> => {
  const response = await fetch("http://localhost:8080/api/auth/me", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu người dùng");
  return response.json();
};

// Hook chỉ để lấy dữ liệu người dùng
export function useUserData(userId: number) {
  const { userData: globalUserData, setUserData } = useUserStore();

  // Sử dụng React Query để lấy dữ liệu
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ["userData", userId],
    queryFn: () => fetchUserData(userId),
    enabled: !globalUserData, // Chỉ gọi API nếu chưa có dữ liệu trong Zustand
    staleTime: 10 * 60 * 1000, // Cache 10 phút
    gcTime: 15 * 60 * 1000, // Giữ trong cache 15 phút
  });

  // Sử dụng useEffect để đồng bộ dữ liệu với Zustand
  useEffect(() => {
    if (fetchedData && !globalUserData) {
      setUserData(fetchedData);
    }
  }, [fetchedData, globalUserData, setUserData]);

  // Dữ liệu cuối cùng để trả về (ưu tiên dữ liệu từ Zustand nếu có)
  const userData = globalUserData || fetchedData;

  return {
    userData, // Dữ liệu người dùng
    isLoading, // Trạng thái đang tải
    error, // Lỗi nếu có
  };
}