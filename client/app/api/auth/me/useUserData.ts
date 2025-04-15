import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { useEffect } from "react";

// Interface cho dữ liệu người dùng
export interface UserData {
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

// Zustand store
interface UserStore {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
}

const useUserStore = create<UserStore>((set) => ({
  userData: null,
  setUserData: (data) => set({ userData: data }),
}));

// API lấy thông tin người dùng hiện tại
const fetchUserData = async (): Promise<UserData> => {
  const response = await fetch("http://localhost:8080/api/auth/me", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      await logout();
      throw new Error("Không được phép: Vui lòng đăng nhập lại");
    }
    throw new Error("Lỗi khi lấy dữ liệu người dùng");
  }

  return response.json();
};

// Custom hook
export function useUserData() {
  const { userData: globalUserData, setUserData } = useUserStore();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (fetchedData) {
      setUserData(fetchedData); // luôn cập nhật lại dữ liệu mới
    }
  }, [fetchedData, setUserData]);

  const userData = fetchedData || globalUserData;

  return {
    userData,
    isLoading,
    error,
  };
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

async function logout(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Logout failed! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error instanceof Error ? error : new Error("Failed to logout");
  }
}