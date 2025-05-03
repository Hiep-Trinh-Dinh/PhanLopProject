/**
 * Admin User API Client
 */

export interface AdminUserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  image: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  postsCount: number;
  friendsCount: number;
  status: 'active' | 'locked' | 'pending';
  role: 'user' | 'moderator' | 'admin';
  createdAt: string;
  updatedAt: string;
  lastSeen?: string;
  password?: string; // Chỉ dùng khi tạo user mới
}

export interface AdminUserListResponse {
  users: AdminUserDto[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const AdminUserApi = {
  /**
   * Lấy danh sách user có phân trang, tìm kiếm, lọc
   */
  async getUsers(
    page: number = 0,
    size: number = 10,
    query: string = '',
    sortBy: string = 'id',
    sortDir: string = 'asc',
    status: string = 'all'
  ): Promise<AdminUserListResponse> {
    try {
      // Dùng API không xác thực cho môi trường phát triển
      console.log('Gọi API admin không yêu cầu xác thực cho môi trường phát triển');
      
      const url = new URL(`${API_BASE_URL}/api/admin/users`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('size', size.toString());
      if (query) url.searchParams.append('query', query);
      url.searchParams.append('sortBy', sortBy);
      url.searchParams.append('sortDir', sortDir);
      url.searchParams.append('status', status);

      console.log('Cookie hiện tại:', document.cookie);
      
      // Debug: kiểm tra cookie auth_token
      const authTokenMatch = document.cookie.match(/auth_token=([^;]*)/);
      if (authTokenMatch) {
        console.log('Tìm thấy auth_token cookie:', authTokenMatch[1].substring(0, 20) + '...');
      } else {
        console.warn('Không tìm thấy auth_token cookie');
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        
        try {
          // Thử parse JSON nếu có
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Không thể lấy danh sách người dùng');
        } catch (e) {
          // Nếu không phải JSON
          throw new Error(response.status === 403 ? 'Forbidden: Không có quyền truy cập' : errorText || 'Không thể lấy danh sách người dùng');
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết user
   */
  async getUserDetail(userId: number): Promise<AdminUserDto> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể lấy thông tin người dùng');
      }

      return await response.json();
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng ID ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Tạo người dùng mới
   */
  async createUser(userData: Partial<AdminUserDto>): Promise<AdminUserDto> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể tạo người dùng mới');
      }

      return await response.json();
    } catch (error) {
      console.error('Lỗi khi tạo người dùng mới:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin người dùng
   */
  async updateUser(userId: number, userData: Partial<AdminUserDto>): Promise<AdminUserDto> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể cập nhật thông tin người dùng');
      }

      return await response.json();
    } catch (error) {
      console.error(`Lỗi khi cập nhật người dùng ID ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Khóa tài khoản người dùng
   */
  async lockUser(userId: number): Promise<{ message: string; user: AdminUserDto }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/lock`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể khóa tài khoản người dùng');
      }

      return await response.json();
    } catch (error) {
      console.error(`Lỗi khi khóa người dùng ID ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Mở khóa tài khoản người dùng
   */
  async unlockUser(userId: number): Promise<{ message: string; user: AdminUserDto }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/unlock`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể mở khóa tài khoản người dùng');
      }

      return await response.json();
    } catch (error) {
      console.error(`Lỗi khi mở khóa người dùng ID ${userId}:`, error);
      throw error;
    }
  }
}; 