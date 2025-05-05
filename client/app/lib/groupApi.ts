import axios, { AxiosInstance } from "axios";
import { PostDto } from "./api";

// Các interface giữ nguyên
export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  image?: string;
}

export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: PageMetadata;
  _embedded?: {
    groupDtoList?: T[];
    groupMemberDtoList?: T[];
    membershipRequestDtoList?: T[];
  };
  _links?: {
    self: { href: string };
    next?: { href: string };
    prev?: { href: string };
    first?: { href: string };
    last?: { href: string };
  };
}

export interface GroupDto {
  id: number;
  name: string;
  description?: string;
  avatar?: string;
  cover?: string;
  createdAt?: string;
  privacy: string;
  rules?: string;
  createdById: number;
  memberCount: number;
  postCount: number;
  mediaCount?: number;
  isAdmin: boolean;
  isMember: boolean;
}

export interface GroupMemberDto {
  user: UserDto;
  role: string;
  joinedAt: string;
}

export interface NotificationDto {
  id: number;
  user: UserDto;
  actor?: UserDto;
  content: string;
  link?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface MembershipRequestDto {
  id: number;
  group: GroupDto;
  user: UserDto;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Tạo instance axios
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // Gửi cookie tự động
  timeout: 30000, // Timeout 30 giây
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Kiểm tra kết nối server
async function checkServerConnectivity(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: 5000,
      withCredentials: true,
    });
    return response.status === 200;
  } catch (error) {
    console.warn("Không thể kết nối đến server:", error);
    return false;
  }
}

// Interceptor cho yêu cầu
api.interceptors.request.use(
  async (config) => {
    // Kiểm tra kết nối mạng
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error("Không có kết nối mạng. Vui lòng kiểm tra internet.");
    }

    // Kiểm tra kết nối server
    const isServerAvailable = await checkServerConnectivity();
    if (!isServerAvailable) {
      console.warn("Server không phản hồi, yêu cầu có thể thất bại.");
    }

    return config;
  },
  (error) => {
    console.error("Lỗi interceptor yêu cầu:", error);
    return Promise.reject(error);
  }
);

// Interceptor cho phản hồi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chuẩn hóa lỗi
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      "Lỗi không xác định";
    console.error("Lỗi API:", error.response?.status, message);

    // Xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."));
    }

    // Xử lý lỗi CORS
    if (error.message.includes("Network Error") || error.message.includes("CORS")) {
      console.error("Lỗi CORS hoặc kết nối:", error);
      return Promise.reject(
        new Error(
          "Không thể kết nối đến server do lỗi CORS. Vui lòng kiểm tra cấu hình server."
        )
      );
    }

    return Promise.reject(
      new Error(typeof message === "string" ? message : JSON.stringify(message))
    );
  }
);

// Các phương thức groupApi
export const groupApi = {
  createGroup: async (groupData: Partial<GroupDto>): Promise<GroupDto> => {
    const response = await api.post("/groups", groupData);
    return response.data;
  },

  getGroupById: async (id: number, authToken?: string): Promise<GroupDto> => {
    if (!id || isNaN(id)) {
      throw new Error("Invalid group ID");
    }
  
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      };
  
      // Thêm cookie vào header nếu có
      if (authToken) {
        headers["Cookie"] = `auth_token=${authToken}`;
      }
  
      const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
        method: "GET",
        credentials: "include", // Giữ để client-side vẫn gửi cookie tự động
        headers,
      });
  
      const responseText = await response.text();
  
      if (!response.ok) {
        console.error("Error response for group", id, ":", responseText);
        if (response.status === 401) {
          console.log("Redirecting to login due to 401 Unauthorized");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("401 Unauthorized: Vui lòng đăng nhập lại");
        }
        if (response.status === 403) {
          throw new Error("403 Forbidden: Không có quyền xem nhóm này");
        }
        if (response.status === 404) {
          throw new Error("404 Not Found: Nhóm không tồn tại");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
      }
  
      const data = JSON.parse(responseText);
      return data;
    } catch (error) {
      console.error("Error fetching group:", error);
      throw error instanceof Error ? error : new Error("Không thể lấy thông tin nhóm");
    }
  },

  getAllGroups: async (
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<GroupDto>> => {
    try {
      console.log(`Đang lấy nhóm, trang: ${page}, kích thước: ${size}`);
  
      // Lấy token từ localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/groups?page=${page}&size=${size}`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
      } catch (fetchError) {
        console.error("Lỗi kết nối API:", fetchError);
        return {
          content: [],
          page: {
            size,
            totalElements: 0,
            totalPages: 0,
            number: page,
          },
          _links: {
            self: { href: `/api/groups?page=${page}&size=${size}` }
          }
        };
      }
  
      if (!response.ok) {
        console.error(`Lỗi API: ${response.status} - ${response.statusText}`);
  
        if (response.status === 401) {
          throw new Error("401 Unauthorized: Vui lòng đăng nhập lại");
        }
  
        return {
          content: [],
          page: {
            size,
            totalElements: 0,
            totalPages: 0,
            number: page,
          },
          _links: {
            self: { href: `/api/groups?page=${page}&size=${size}` }
          }
        };
      }
  
      const data = await response.json();
  
      const groupList: GroupDto[] = data._embedded?.groupDtoList || [];
  
      return {
        content: groupList,
        page: {
          size: data.page?.size || size,
          totalElements: data.page?.totalElements || 0,
          totalPages: data.page?.totalPages || 0,
          number: data.page?.number || page,
        },
        _links: data._links,
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhóm:", error);
      return {
        content: [],
        page: {
          size,
          totalElements: 0,
          totalPages: 0,
          number: page,
        },
        _links: {
          self: { href: `/api/groups?page=${page}&size=${size}` }
        }
      };
    }
  },

  getUserGroups: async (
    userId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<GroupDto>> => {
    const response = await api.get(
      `/users/${userId}/groups?page=${page}&size=${size}`
    );
    return {
      content: response.data._embedded?.groupDtoList || [],
      page: {
        size: response.data.page.size,
        totalElements: response.data.page.totalElements,
        totalPages: response.data.page.totalPages,
        number: response.data.page.number,
      },
      _links: response.data._links,
    };
  },

  updateGroup: async (
    groupId: number,
    groupData: Partial<GroupDto>
  ): Promise<GroupDto> => {
    const response = await api.put(`/groups/${groupId}`, groupData);
    return response.data;
  },

  deleteGroup: async (groupId: number): Promise<void> => {
    await api.delete(`/groups/${groupId}`);
  },

  createMembershipRequest: async (groupId: number, userId: number): Promise<string> => {
    try {
      const response = await api.post(`/groups/${groupId}/membership-requests`, null, {
        params: { userId },
      });
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi tạo yêu cầu tham gia:", error);
      throw new Error(error.response?.data || "Không thể gửi yêu cầu tham gia");
    }
  },
  
  addMember: async (groupId: number, userId: number): Promise<GroupDto | string> => {
    try {
      // Lấy thông tin nhóm để kiểm tra privacy
      const group = await groupApi.getGroupById(groupId);
      if (group.privacy === "PRIVATE") {
        // Với nhóm riêng tư, tạo yêu cầu tham gia
        return await groupApi.createMembershipRequest(groupId, userId);
      } else {
        // Với nhóm công khai, thêm thành viên trực tiếp
        const response = await api.post(`/groups/${groupId}/members`, null, {
          params: { userId },
        });
        return response.data;
      }
    } catch (error: any) {
      console.error("Lỗi khi thêm thành viên:", error);
      throw new Error(error.response?.data || "Không thể thêm thành viên");
    }
  },

  getUserMembershipRequests: async (userId: number, page: number = 0, size: number = 10): Promise<PagedResponse<MembershipRequestDto>> => {
    const response = await api.get(`/users/${userId}/membership-requests?page=${page}&size=${size}`);
    return {
      content: response.data._embedded?.membershipRequestDtoList || [],
      page: {
        size: response.data.page.size,
        totalElements: response.data.page.totalElements,
        totalPages: response.data.page.totalPages,
        number: response.data.page.number,
      },
      _links: response.data._links,
    };
  },

  handleMembershipRequest: async (
    groupId: number,
    requestId: number,
    approve: boolean
  ): Promise<GroupDto | string> => {
    const response = await api.post(
      `/groups/${groupId}/membership-requests/${requestId}`,
      null,
      { params: { approve } }
    );
    return response.data;
  },

  removeMember: async (groupId: number, userId: number): Promise<GroupDto> => {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  },


  updateMemberRole: async (
    groupId: number,
    userId: number,
    role: string
  ): Promise<GroupDto> => {
    try {
      const response = await api.put(
        `/groups/${groupId}/members/${userId}/role`,
        null,
        { params: { role } }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data || "Vai trò không hợp lệ hoặc người dùng không phải thành viên");
      } else if (error.response?.status === 403) {
        throw new Error("Chỉ quản trị viên mới có quyền cập nhật vai trò");
      } else {
        throw error;
      }
    }
  },

  getGroupMembers: async (
    groupId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<GroupMemberDto>> => {
    if (!groupId || isNaN(groupId)) {
      throw new Error("Invalid group ID");
    }
  
    try {
      console.log(`Đang lấy danh sách thành viên nhóm ${groupId}, trang: ${page}, kích thước: ${size}`);

      // Lấy token từ localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members?page=${page}&size=${size}`, {
          method: "GET",
          credentials: "include", // Gửi cookie tự động
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '', // Thêm token nếu có
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
      } catch (fetchError) {
        console.error("Lỗi kết nối API:", fetchError);
        return {
          content: [],
          page: {
            size,
            totalElements: 0,
            totalPages: 0,
            number: page,
          },
          _links: {
            self: { href: `/api/groups/${groupId}/members?page=${page}&size=${size}` },
          },
        };
      }
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Lỗi API: ${response.status} - ${response.statusText}`, errorText);
  
        if (response.status === 401) {
          throw new Error("401 Unauthorized: Vui lòng đăng nhập lại");
        }
        if (response.status === 403) {
          throw new Error("Không có quyền truy cập danh sách thành viên nhóm");
        }
        if (response.status === 404) {
          throw new Error("Không tìm thấy nhóm");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
  
      const data = await response.json();
      console.log("Dữ liệu thành viên nhóm:", data);
  
      return {
        content: data._embedded?.groupMemberDtoList || [],
        page: {
          size: data.page?.size || size,
          totalElements: data.page?.totalElements || 0,
          totalPages: data.page?.totalPages || 0,
          number: data.page?.number || page,
        },
        _links: data._links || {
          self: { href: `/api/groups/${groupId}/members?page=${page}&size=${size}` },
        },
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thành viên nhóm:", error);
      throw error instanceof Error ? error : new Error("Không thể lấy danh sách thành viên nhóm");
    }
  },

  getMembershipRequests: async (
    groupId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<MembershipRequestDto>> => {
    const response = await api.get(
      `/groups/${groupId}/membership-requests?page=${page}&size=${size}`
    );
    return {
      content: response.data._embedded?.membershipRequestDtoList || [],
      page: {
        size: response.data.page.size,
        totalElements: response.data.page.totalElements,
        totalPages: response.data.page.totalPages,
        number: response.data.page.number,
      },
      _links: response.data._links,
    };
  },

  searchGroupMembers: async (
    groupId: number,
    query: string,
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<GroupMemberDto>> => {
    if (!groupId || isNaN(groupId)) {
      throw new Error("Invalid group ID");
    }
    if (!query || query.trim().length === 0) {
      throw new Error("Query cannot be empty");
    }

    try {
      console.log(`Đang tìm kiếm thành viên trong nhóm ${groupId}, query: ${query}, trang: ${page}, kích thước: ${size}`);

      // Lấy token từ localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      let response;
      try {
        response = await fetch(
          `${API_BASE_URL}/api/groups/${groupId}/members/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        );
      } catch (fetchError) {
        console.error("Lỗi kết nối API:", fetchError);
        return {
          content: [],
          page: {
            size,
            totalElements: 0,
            totalPages: 0,
            number: page,
          },
          _links: {
            self: { href: `/api/groups/${groupId}/members/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}` },
          },
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Lỗi API: ${response.status} - ${response.statusText}`, errorText);
        if (response.status === 401) {
          throw new Error("401 Unauthorized: Vui lòng đăng nhập lại");
        }
        if (response.status === 403) {
          throw new Error("Không có quyền tìm kiếm thành viên nhóm");
        }
        if (response.status === 404) {
          throw new Error("Nhóm không tồn tại");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Dữ liệu tìm kiếm thành viên:", data);

      return {
        content: data._embedded?.groupMemberDtoList || [],
        page: {
          size: data.page?.size || size,
          totalElements: data.page?.totalElements || 0,
          totalPages: data.page?.totalPages || 0,
          number: data.page?.number || page,
        },
        _links: data._links || {
          self: { href: `/api/groups/${groupId}/members/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}` },
        },
      };
    } catch (error) {
      console.error("Lỗi khi tìm kiếm thành viên nhóm:", error);
      throw error instanceof Error ? error : new Error("Không thể tìm kiếm thành viên nhóm");
    }
  },
  
};