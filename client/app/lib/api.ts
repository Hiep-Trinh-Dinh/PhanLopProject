export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  image?: string;
  isFriend?: boolean;
  friend?: boolean;
  pendingFriendRequest?: boolean;
  receivedFriendRequest?: boolean;
}

export interface MediaDto {
  mediaType: string;
  url: string;
}

export interface CommentDto {
  id: number;
  content: string;
  user: UserDto;
  createdAt: string;
  updatedAt: string;
  totalLikes: number;
  liked: boolean;
  parentId?: number;
  replyCount?: number;
  replies?: CommentDto[];
}

export interface PostDto {
  id: number;
  user: UserDto;
  content: string;
  media: MediaDto[];
  privacy: string;
  createdAt: string;
  updatedAt: string;
  totalLikes: number;
  liked: boolean;
  totalReposts: number;
  reposted: boolean;
  repostUserIds: number[];
  totalComments: number;
  previewComments: CommentDto[];
  isActive?: boolean;
  groupId?: number;
  groupName?: string;
}

export interface FriendshipDto {
  id: number;
  user: UserDto;
  friend: UserDto;
  status: string;
  mutualFriendsCount: number;
  createdAt: string;
  updatedAt: string;
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
  _links?: {
    self: { href: string };
    next?: { href: string };
    prev?: { href: string };
    first?: { href: string };
    last?: { href: string };
  };
}

export interface FriendRequestDto {
  id: number;
  user: UserDto;
  status: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// Thêm interface cho thông báo
export interface NotificationDto {
  id: number;
  actor?: UserDto;
  type: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  referenceId?: number;
}

// Kiểm tra và đảm bảo API_BASE_URL không kết thúc bằng "/api"
const API_BASE_URL = (() => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  
  // Loại bỏ '/' ở cuối nếu có
  const baseUrlWithoutTrailingSlash = baseUrl.endsWith('/') 
    ? baseUrl.slice(0, -1) 
    : baseUrl;
  
  // Loại bỏ '/api' ở cuối nếu có
  return baseUrlWithoutTrailingSlash.endsWith('/api')
    ? baseUrlWithoutTrailingSlash.slice(0, -4)
    : baseUrlWithoutTrailingSlash;
})();

// Ngăn chặn lỗi console xuất hiện bằng cách bỏ qua các lỗi không quan trọng
if (typeof window !== 'undefined') {
  // Lưu lại hàm console.error gốc
  const originalConsoleError = console.error;
  
  // Ghi đè console.error để lọc các lỗi không cần thiết
  console.error = function(...args) {
    // Danh sách các lỗi không cần báo cáo
    const ignoredErrors = [
      'Failed to fetch',
      'NetworkError',
      'Network request failed',
      'Không thể kết nối đến server',
      'TypeError: Failed to fetch',
      'Error searching',
      'Error fetching',
      'Cannot read properties of undefined',
      'Lỗi khi tải dữ liệu',
      'AbortError',
      'timeout'
    ];
    
    // Kiểm tra nếu lỗi nằm trong danh sách bỏ qua
    const shouldIgnore = ignoredErrors.some(errorMsg => 
      args.some(arg => typeof arg === 'string' && arg.includes(errorMsg))
    );
    
    // Nếu không phải lỗi cần bỏ qua, hoặc là hàm được gọi từ mã nguồn chính (không phải thư viện)
    if (!shouldIgnore) {
      originalConsoleError.apply(console, args);
    }
  };
}

/**
 * Kiểm tra kết nối đến server
 * @param url URL cần kiểm tra
 * @returns Promise xác định server có phản hồi hay không
 */
async function checkServerConnectivity(url: string): Promise<boolean> {
  try {
    // Sử dụng URL API thực tế thay vì root
    const testUrl = `${url}/api/health`;
    
    // Sử dụng GET request thay vì HEAD
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 giây timeout
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'no-cors', // Cho phép kiểm tra server ngay cả khi CORS không hỗ trợ
      cache: 'no-cache',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true; // Kết nối thành công
  } catch (error) {
    console.error("Không thể kết nối đến server:", error);
    return false; // Kết nối thất bại
  }
}

/**
 * Hàm tiện ích để thực hiện các yêu cầu API có xác thực
 * @param path Đường dẫn tương đối của API
 * @param options Tùy chọn fetch
 * @returns Dữ liệu JSON từ phản hồi
 */
async function fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Kiểm tra nếu là request liên quan đến thông báo thì chỉ thực hiện một lần duy nhất, không retry
  const isNotificationRequest = path.includes('/api/notifications');
  
  // Số lần retry phụ thuộc vào loại request
  const maxRetries = isNotificationRequest ? 0 : 3; // 0 = không retry cho thông báo, 3 cho các loại khác
  let retries = 0;
  let lastError: Error | null = null;

  // Kiểm tra kết nối mạng
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error("Không có kết nối mạng. Vui lòng kiểm tra lại kết nối internet của bạn.");
  }
  
  // Tạo đường dẫn đầy đủ
  const url = `${API_BASE_URL}${path}`;
  
  // Kiểm tra URL hợp lệ
  try {
    new URL(url);
  } catch (error) {
    console.error("URL không hợp lệ:", url, error);
    throw new Error(`URL API không hợp lệ: ${url}`);
  }
  
  // Kiểm tra kết nối đến server API trước - bỏ qua với request thông báo
  let isServerAvailable = true;
  if (!isNotificationRequest) {
    isServerAvailable = await checkServerConnectivity(API_BASE_URL);
    if (!isServerAvailable) {
      console.warn("Server không phản hồi, sẽ thử lại hoặc sử dữ liệu cache");
    }
  }

  while (retries <= maxRetries) {
    try {
      // Chỉ log cho lần thử đầu tiên hoặc khi không phải là request thông báo
      if (retries === 0 || !isNotificationRequest) {
        console.log(`Fetching ${isNotificationRequest ? '(single attempt)' : `(attempt ${retries + 1}/${maxRetries + 1})`}: ${url}`);
      }
      
      // Thêm timeout cho fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Timeout sau 30 giây thay vì 10 giây
      
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Luôn gửi cookies để xác thực
        signal: controller.signal
      });
      
      // Xóa timeout nếu request thành công
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        
        // Xử lý các mã lỗi phổ biến
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Vui lòng đăng nhập lại");
        }
        if (response.status === 403) {
          throw new Error("403 Forbidden: Bạn không có quyền thực hiện hành động này");
        }
        if (response.status === 404) {
          throw new Error("404 Not Found: Không tìm thấy tài nguyên");
        }
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Kiểm tra phản hồi rỗng (status 204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          return await response.json();
        } catch (jsonError) {
          console.error("Lỗi khi parse JSON:", jsonError);
          throw new Error("Lỗi khi xử lý dữ liệu JSON từ server");
        }
      } else {
        // Trả về text nếu không phải JSON
        const text = await response.text();
        try {
          // Thử chuyển đổi text thành JSON
          return JSON.parse(text) as T;
        } catch {
          // Nếu không phải JSON, trả về như là một đối tượng
          return { content: text } as unknown as T;
        }
      }
    } catch (error) {
      // Xử lý lỗi abort timeout
      if (error instanceof DOMException && error.name === 'AbortError') {
        lastError = new Error("Yêu cầu bị hủy do timeout. Server không phản hồi kịp thời.");
        console.error(`Fetch attempt ${retries + 1} timed out`);
      } else {
        lastError = error instanceof Error ? error : new Error("Lỗi khi gửi yêu cầu");
        console.error(`Fetch attempt ${retries + 1} failed:`, lastError);
      }
      
      // Kiểm tra tình trạng kết nối mạng
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error("Mất kết nối mạng. Vui lòng kiểm tra lại kết nối internet của bạn.");
      }
      
      // Đối với request thông báo, không thực hiện retry
      if (isNotificationRequest) {
        break;
      }
      
      retries++;
      if (retries <= maxRetries) {
        // Exponential backoff: đợi thời gian tăng dần giữa các lần thử lại
        const delay = Math.min(1000 * Math.pow(2, retries - 1), 8000);
        console.log(`Đang thử lại sau ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Kiểm tra lại kết nối mạng sau khi tất cả các lần thử thất bại
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error("Không có kết nối mạng. Vui lòng kiểm tra lại kết nối internet của bạn.");
  }
  
  // Đối với request thông báo, trả về giá trị mặc định khi thất bại
  if (isNotificationRequest) {
    console.log("Không thể kết nối đến API thông báo, trả về giá trị mặc định");
    
    // Trả về giá trị mặc định tùy thuộc vào endpoint
    if (path.includes('/notifications/count')) {
      return 0 as T; // Trả về 0 thông báo chưa đọc
    } else if (path.includes('/notifications/unread')) {
      return [] as unknown as T; // Trả về mảng rỗng cho thông báo chưa đọc
    } else if (path.includes('/notifications') && !path.includes('read') && !path.includes('delete')) {
      // Cho API lấy danh sách thông báo
      return {
        content: [],
        page: {
          size: 20,
          totalElements: 0,
          totalPages: 0,
          number: 0
        }
      } as unknown as T;
    }
  }
  
  // Nếu tất cả các lần thử đều thất bại, ném lỗi cuối cùng
  throw lastError || new Error("Không thể kết nối đến máy chủ sau nhiều lần thử. Vui lòng thử lại sau.");
}

export const logout = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Logout failed! status: ${response.status}`);
    }
    
    // Đăng xuất thành công, trạng thái offline đã được cập nhật ở server
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const PostApi = {
  // Get all posts with pagination
  getAll: async (
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<PostDto>> => {
    try {
      console.log(`Đang lấy bài viết, trang: ${page}, kích thước: ${size}`);

      // Lấy token từ localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/posts?page=${page}&size=${size}`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token || ''
          }
        });
      } catch (fetchError) {
        console.error("Lỗi kết nối API:", fetchError);
        // Trả về danh sách rỗng khi có lỗi kết nối
        return {
          content: [],
          page: {
            size: size,
            totalElements: 0,
            totalPages: 0,
            number: page,
          },
          _links: {
            self: { href: `/api/posts?page=${page}&size=${size}` }
          }
        };
      }

      if (!response.ok) {
        console.error(`Lỗi API: ${response.status} - ${response.statusText}`);
        
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Vui lòng đăng nhập lại");
        }
        
        // Trả về danh sách rỗng cho lỗi 500 hoặc các lỗi khác
        return {
          content: [],
          page: {
            size: size,
            totalElements: 0,
            totalPages: 0,
            number: page,
          },
          _links: {
            self: { href: `/api/posts?page=${page}&size=${size}` }
          }
        };
      }

      const data = await response.json();
      console.log("Dữ liệu bài viết:", data);
      
      // Lọc các bài viết đã bị ẩn (nếu server trả về cả bài viết ẩn)
      const filteredPosts = data._embedded?.postDtoList?.filter((post: any) => {
        // Bỏ qua bài viết không có dữ liệu hợp lệ
        if (!post || !post.id) return false;
        
        // Nếu có trường isActive trong API response, lọc theo đó
        // Bài viết được hiển thị khi isActive = false
        return post.isActive === undefined || post.isActive === false;
      }) || [];

      console.log(`Đã lọc bài viết: ${filteredPosts.length} / ${data._embedded?.postDtoList?.length || 0} bài viết`);

      return {
        content: filteredPosts,
        page: {
          size: data.page?.size || size,
          totalElements: data.page?.totalElements || 0,
          totalPages: data.page?.totalPages || 0,
          number: data.page?.number || page,
        },
        _links: data._links,
      };
    } catch (error) {
      console.error("Lỗi khi lấy bài viết:", error);
      
      // Trả về danh sách rỗng cho mọi loại lỗi, không throw lỗi nữa
      return {
        content: [],
        page: {
          size: size,
          totalElements: 0,
          totalPages: 0,
          number: page,
        },
        _links: {
          self: { href: `/api/posts?page=${page}&size=${size}` }
        }
      };
    }
  },

  getGroupPosts: async (
    groupId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<PostDto>> => {
    try {
      console.log(`Đang lấy bài viết nhóm ${groupId}, trang: ${page}, kích thước: ${size}`);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/api/posts/group/${groupId}?page=${page}&size=${size}`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        }
      });
  
      if (!response.ok) {
        if (response.status !== 404 && response.status !== 500) {
          const errorText = await response.text();
          console.error(`Error response for group ${groupId} posts:`, errorText);
        }
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        if (response.status === 403) {
          throw new Error("403 Forbidden: You don't have permission to view this group's posts");
        }
        if (response.status === 404) {
          throw new Error("404 Not Found: Group not found");
        }
        return {
          content: [],
          page: {
            size: size,
            totalElements: 0,
            totalPages: 0,
            number: page,
          },
          _links: {
            self: { href: `/api/posts/group/${groupId}?page=${page}&size=${size}` }
          }
        };
      }
  
      const data = await response.json();
      const filteredPosts = data._embedded?.postDtoList?.filter((post: any) => {
        if (!post || !post.id) return false;
        return post.isActive === undefined || post.isActive === false;
      }) || [];
  
      console.log(`Đã lọc bài viết nhóm ${groupId}: ${filteredPosts.length} / ${data._embedded?.postDtoList?.length || 0} bài viết`);
  
      return {
        content: filteredPosts,
        page: {
          size: data.page?.size || size,
          totalElements: data.page?.totalElements || 0,
          totalPages: data.page?.totalPages || 0,
          number: data.page?.number || page,
        },
        _links: data._links,
      };
    } catch (error) {
      console.error(`Error fetching posts for group ${groupId}:`, error);
      return {
        content: [],
        page: {
          size: size,
          totalElements: 0,
          totalPages: 0,
          number: page,
        },
        _links: {
          self: { href: `/api/posts/group/${groupId}?page=${page}&size=${size}` }
        }
      };
    }
  },

  // Get posts for a specific user
  getUserPosts: async (
    userId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<PostDto>> => {
    try {
      // Không ghi log thông thường để tránh làm rối console
      // console.log(`Fetching posts for user ${userId} from API`);

      // Lấy token từ localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Use the correct endpoint with proper headers
      const response = await fetch(`${API_BASE_URL}/api/posts/user/${userId}?page=${page}&size=${size}`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        }
      });

      if (!response.ok) {
        // Không hiển thị lỗi 404 và 500 trong console vì đó là trường hợp dự kiến
        if (response.status !== 404 && response.status !== 500) {
          const errorText = await response.text();
          console.error(`Error response for user ${userId} posts:`, errorText);
        }
        
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        
        // Sử dụng fallback cho KHÔNG CHỈ lỗi 404 và 500 mà TẤT CẢ các lỗi khác
        // console.warn(`Server returned ${response.status}, falling back to client-side filtering`);
        return PostApi.getUserPostsClientSide(userId, page, size);
      }

      const data = await response.json();
      // console.log("Raw user posts response:", data);
      
      // Lọc các bài viết đã bị ẩn (nếu server trả về cả bài viết ẩn)
      const filteredPosts = data._embedded?.postDtoList?.filter((post: any) => {
        // Bỏ qua bài viết không có dữ liệu hợp lệ
        if (!post || !post.id) return false;
        
        // Nếu có trường isActive trong API response, lọc theo đó
        // Bài viết được hiển thị khi isActive = false
        return post.isActive === undefined || post.isActive === false;
      }) || [];

      console.log(`Đã lọc bài viết của người dùng ${userId}: ${filteredPosts.length} / ${data._embedded?.postDtoList?.length || 0} bài viết`);

      return {
        content: filteredPosts,
        page: {
          size: data.page?.size || size,
          totalElements: data.page?.totalElements || 0,
          totalPages: data.page?.totalPages || 0,
          number: data.page?.number || page,
        },
        _links: data._links,
      };
    } catch (error) {
      // Chỉ log lỗi nghiêm trọng không xử lý được
      if (!(error instanceof Error && (error.message.includes("falling back") || 
           error.message.includes("500") || 
           error.message.includes("404")))) {
        console.error(`Error fetching posts for user ${userId}:`, error);
      }
      
      // LUÔN sử dụng fallback khi có lỗi, bất kể loại lỗi là gì
      return PostApi.getUserPostsClientSide(userId, page, size);
    }
  },
  
  // Get shared posts for a specific user
  getSharedPostsByUserId: async (
    userId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<PostDto>> => {
    try {
      // Giảm log không cần thiết
      // console.log(`Fetching shared posts for user ${userId} from API`);
      
      // Lấy token từ localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch(`${API_BASE_URL}/api/posts/user/${userId}/shared?page=${page}&size=${size}`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        }
      });

      if (!response.ok) {
        // Không hiển thị lỗi trong console vì đã được xử lý
        // console.warn(`Error fetching shared posts for user ${userId}: ${response.status}`);
        
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        
        // Sử dụng fallback khi API không khả dụng
        return PostApi.getSharedPostsClientSide(userId, page, size);
      }

      const data = await response.json();
      // console.log("Raw shared posts response:", data);
      
      // Lọc các bài viết đã bị ẩn (nếu server trả về cả bài viết ẩn)
      const filteredPosts = data._embedded?.postDtoList?.filter((post: any) => {
        // Bỏ qua bài viết không có dữ liệu hợp lệ
        if (!post || !post.id) return false;
        
        // Nếu có trường isActive trong API response, lọc theo đó
        // Bài viết được hiển thị khi isActive = false
        return post.isActive === undefined || post.isActive === false;
      }) || [];

      console.log(`Đã lọc bài viết chia sẻ: ${filteredPosts.length} / ${data._embedded?.postDtoList?.length || 0} bài viết`);

      return {
        content: filteredPosts,
        page: {
          size: data.page?.size || size,
          totalElements: data.page?.totalElements || 0,
          totalPages: data.page?.totalPages || 0,
          number: data.page?.number || page,
        },
        _links: data._links,
      };
    } catch (error) {
      console.error(`Error fetching shared posts for user ${userId}:`, error);
      
      // Sử dụng fallback khi có lỗi bất kỳ
      return PostApi.getSharedPostsClientSide(userId, page, size);
    }
  },
  
  // Client-side implementation for getUserPosts as fallback
  getUserPostsClientSide: async (
    userId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<PostDto>> => {
    try {
      // console.log(`Getting posts for user ${userId} (client-side filtered)`);
      
      // Fetch all posts with larger page size to have enough after filtering
      const allPostsResponse = await PostApi.getAll(page, size * 3);
      
      // Filter posts by user ID and active status
      const userPosts = allPostsResponse.content.filter(post => 
        post.user.id === userId && (post.isActive === undefined || post.isActive === false)
      );
      // console.log(`Found ${userPosts.length} posts for user ${userId} after filtering`);
      
      // Create a new PagedResponse with filtered posts
      return {
        content: userPosts,
        page: {
          size: size,
          totalElements: userPosts.length,
          totalPages: Math.ceil(userPosts.length / size),
          number: page,
        },
        _links: allPostsResponse._links
      };
    } catch (error) {
      console.error(`Error in client-side filtering for user ${userId}:`, error);
      // Nếu thất bại, trả về danh sách rỗng thay vì throw lỗi
      return {
        content: [],
        page: {
          size: size,
          totalElements: 0,
          totalPages: 0,
          number: page,
        },
        _links: {
          self: { href: `/api/posts/user/${userId}?page=${page}&size=${size}` }
        }
      };
    }
  },

  // Get single post by ID
  getById: async (id: number): Promise<PostDto> => {
    if (!id || isNaN(id)) {
      throw new Error("Invalid post ID");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response for post", id, ":", errorText);
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        if (response.status === 404) {
          throw new Error("Post not found");
        }
        if (response.status === 403) {
          throw new Error("No permission to view this post");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Raw post response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error instanceof Error ? error : new Error("Failed to fetch post");
    }
  },

  // Create new post
  create: async (formData: FormData): Promise<PostDto> => {
    try {
      console.log("Sending POST request to create post...");
      
      // Log form data contents để debug
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`- ${key}: File ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`- ${key}: ${value}`);
        }
      }
      
      // Sử dụng AbortController để quản lý timeout thủ công
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 300000); // 5 phút timeout cho upload video lớn
      
      // Log URL đầy đủ để debug
      const apiUrl = `${API_BASE_URL}/api/posts`;
      console.log("Full API URL:", apiUrl);
      
      // Thử nhiều cách khác nhau để xác định vấn đề
      try {
        console.log("Trying POST to:", apiUrl);
        const response = await fetch(apiUrl, {
          method: "POST",
          credentials: "include",
          body: formData,
          signal: controller.signal
        });
        
        if (!response.ok) {
          // Nếu cách thông thường thất bại, thử lại với URL khác
          if (response.status === 404) {
            console.log("Endpoint not found, trying alternative URLs...");
            
            // Thử với API_BASE_URL trực tiếp
            console.log("Trying with direct posts endpoint");
            const altResponse = await fetch(`${API_BASE_URL}/posts`, {
              method: "POST",
              credentials: "include",
              body: formData,
              signal: controller.signal
            });
            
            if (altResponse.ok) {
              // Nếu thành công thì đổi sang URL này cho các lần sau
              console.log("Alternative URL worked!");
              // Xóa bỏ timeout nếu request thành công
              clearTimeout(timeout);
              
              console.log("Raw create post response status:", altResponse.status);
              
              const result = await altResponse.json();
              console.log("Post created successfully:", result);
              return result;
            } else {
              // Nếu cả 2 cách đều thất bại, ném lỗi với response từ URL gốc
              console.log("All URL variations failed");
              throw new Error(`HTTP error! status: ${response.status}`);
            }
          } else {
            // Xử lý lỗi như thông thường
            const errorText = await response.text();
            console.error("Error response:", errorText);
            
            if (response.status === 401) {
              await logout();
              throw new Error("401 Unauthorized: Please login again");
            }
            if (response.status === 400) {
              throw new Error("400 Bad Request: Invalid post content");
            }
            if (response.status === 413) {
              throw new Error("413 Payload Too Large: Video quá lớn");
            }
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
        } else {
          // Xóa bỏ timeout nếu request thành công
          clearTimeout(timeout);
          
          console.log("Raw create post response status:", response.status);
          
          const result = await response.json();
          console.log("Post created successfully:", result);
          return result;
        }
      } catch (fetchError: any) {
        // Xóa bỏ timeout nếu có lỗi
        clearTimeout(timeout);
        
        // Xử lý trường hợp timeout
        if (fetchError.name === 'AbortError') {
          console.error("Request timed out after 5 minutes");
          throw new Error("Request timed out. Video có thể quá lớn hoặc kết nối mạng không ổn định.");
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error("Error creating post:", error);
      throw error instanceof Error ? error : new Error("Failed to create post");
    }
  },

  // Update post
  update: async (
    id: number,
    content: string,
    privacy: string
  ): Promise<PostDto> => {
    try {
      const formData = new FormData();
      const postDto = { content, privacy };
      formData.append('post', JSON.stringify(postDto));
  
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to edit this post");
        }
        if (response.status === 404) {
          throw new Error("Post not found");
        }
        if (response.status === 415) {
          throw new Error("Unsupported Media Type: Check request format");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error updating post:", error);
      throw error instanceof Error ? error : new Error("Failed to update post");
    }
  },

  // Delete post
  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to delete this post");
        }
        if (response.status === 404) {
          throw new Error("Post not found");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error instanceof Error ? error : new Error("Failed to delete post");
    }
  },

  // Repost post
  repost: async (postId: number): Promise<PostDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/repost`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to repost this post");
        }
        if (response.status === 404) {
          throw new Error("Post not found");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error reposting post:", error);
      throw error instanceof Error ? error : new Error("Failed to repost post");
    }
  },

  // Unrepost (hủy share) post
  unrepost: async (postId: number): Promise<PostDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/repost`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to unrepost this post");
        }
        if (response.status === 404) {
          throw new Error("Post not found");
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error unreposting post:", error);
      throw error instanceof Error ? error : new Error("Failed to unrepost post");
    }
  },

  // Like/Unlike post
  like: {
    add: async (postId: number): Promise<PostDto> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/likes/post/${postId}`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to like this post");
          }
          if (response.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error liking post:", error);
        throw error instanceof Error ? error : new Error("Failed to like post");
      }
    },

    remove: async (postId: number): Promise<PostDto> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/likes/post/${postId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to unlike this post");
          }
          if (response.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error unliking post:", error);
        throw error instanceof Error ? error : new Error("Failed to unlike post");
      }
    },
  },

  // Comments
  comments: {
    getByPostId: async (postId: number): Promise<CommentDto[]> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/comments/post/${postId}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to view comments");
          }
          if (response.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw error instanceof Error ? error : new Error("Failed to fetch comments");
      }
    },

    create: async (postId: number, content: string): Promise<CommentDto> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/comments/post/${postId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 400) {
            throw new Error("Comment content is invalid");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to comment");
          }
          if (response.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error creating comment:", error);
        throw error instanceof Error ? error : new Error("Failed to create comment");
      }
    },

    update: async (commentId: number, content: string): Promise<CommentDto> => {
      try {
        console.log(`Gửi request cập nhật comment ${commentId} với nội dung: ${content.substring(0, 30)}...`);
        const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error response when updating comment ${commentId}:`, errorText);
          // Hiển thị thêm chi tiết về response
          console.error("Response status:", response.status, "Status text:", response.statusText);
          console.error("Response headers:", [...response.headers.entries()]);
          
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 400) {
            throw new Error("Comment content is invalid");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to edit this comment");
          }
          if (response.status === 404) {
            throw new Error("Comment not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log(`Comment ${commentId} updated successfully:`, result);
        return result;
      } catch (error) {
        console.error(`Error updating comment ${commentId}:`, error);
        if (error instanceof Error) {
          console.error("Error details:", error.message, error.stack);
        }
        throw error instanceof Error ? error : new Error("Failed to update comment");
      }
    },

    createReply: async (postId: number, parentCommentId: number, content: string): Promise<CommentDto> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/comments/post/${postId}/reply/${parentCommentId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 400) {
            throw new Error("Reply content is invalid");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to reply");
          }
          if (response.status === 404) {
            throw new Error("Post or comment not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error creating reply:", error);
        throw error instanceof Error ? error : new Error("Failed to create reply");
      }
    },

    delete: async (commentId: number): Promise<void> => {
      try {
        console.log(`Gửi request xóa comment ${commentId}`);
        const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error response when deleting comment ${commentId}:`, errorText);
          // Hiển thị thêm chi tiết về response
          console.error("Response status:", response.status, "Status text:", response.statusText);
          console.error("Response headers:", [...response.headers.entries()]);
          
          if (response.status === 401) {
            await logout();
            throw new Error("401 Unauthorized: Please login again");
          }
          if (response.status === 403) {
            throw new Error("You don't have permission to delete this comment");
          }
          if (response.status === 404) {
            throw new Error("Comment not found");
          }
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        console.log(`Comment ${commentId} deleted successfully`);
      } catch (error) {
        console.error(`Error deleting comment ${commentId}:`, error);
        if (error instanceof Error) {
          console.error("Error details:", error.message, error.stack);
        }
        throw error instanceof Error ? error : new Error("Failed to delete comment");
      }
    },
  },

  // Client-side implementation for getSharedPostsByUserId as fallback
  getSharedPostsClientSide: async (
    userId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<PostDto>> => {
    try {
      // console.log(`Getting shared posts for user ${userId} (client-side filtered)`);
      
      // Fetch all posts with larger page size to have enough after filtering
      const allPostsResponse = await PostApi.getAll(page, size * 3);
      
      // Filter posts by reposted users and active status
      const sharedPosts = allPostsResponse.content.filter(post => 
        // Kiểm tra nếu post đã được chia sẻ bởi người dùng và đang hiển thị (isActive = false hoặc undefined)
        post.repostUserIds && 
        post.repostUserIds.includes(userId) && 
        (post.isActive === undefined || post.isActive === false)
      );
      // console.log(`Found ${sharedPosts.length} shared posts for user ${userId} after filtering`);
      
      // Create a new PagedResponse with filtered posts
      return {
        content: sharedPosts,
        page: {
          size: size,
          totalElements: sharedPosts.length,
          totalPages: Math.ceil(sharedPosts.length / size),
          number: page,
        },
        _links: allPostsResponse._links
      };
    } catch (error) {
      console.error(`Error in client-side filtering for shared posts for user ${userId}:`, error);
      // Nếu thất bại, trả về danh sách rỗng thay vì throw lỗi
      return {
        content: [],
        page: {
          size: size,
          totalElements: 0,
          totalPages: 0,
          number: page,
        },
        _links: {
          self: { href: `/api/posts/user/${userId}/shared?page=${page}&size=${size}` }
        }
      };
    }
  },

  // Search posts by content
  searchPosts: async (
    query: string,
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<PostDto>> => {
    try {
      console.log(`Searching posts with query: "${query}", page: ${page}, size: ${size}`);

      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch(`${API_BASE_URL}/api/posts/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        }
      });

      if (!response.ok) {
        if (response.status !== 500) {
          const errorText = await response.text();
          console.error("Error searching posts:", errorText);
        }
        
        if (response.status === 401) {
          await logout();
          throw new Error("401 Unauthorized: Please login again");
        }
        
        // Return empty list for any error
        return {
          content: [],
          page: {
            size: size,
            totalElements: 0,
            totalPages: 0,
            number: page,
          },
          _links: {
            self: { href: `/api/posts/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}` }
          }
        };
      }

      const data = await response.json();
      console.log("Search results:", data);

      return {
        content: data._embedded?.postDtoList || [],
        page: {
          size: data.page?.size || size,
          totalElements: data.page?.totalElements || 0,
          totalPages: data.page?.totalPages || 0,
          number: data.page?.number || page,
        },
        _links: data._links,
      };
    } catch (error) {
      console.error("Error searching posts:", error);
      
      // Return empty list for any error
      return {
        content: [],
        page: {
          size: size,
          totalElements: 0,
          totalPages: 0,
          number: page,
        },
        _links: {
          self: { href: `/api/posts/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}` }
        }
      };
    }
  }
};

export const getAllConversations = async () => {
  try {
    const response = await fetch('/api/messages/conversations/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all conversations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all conversations:', error);
    throw error;
  }
};

export const getConversation = async (conversationId: number) => {
  try {
    const response = await fetch(`/api/messages/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

export const getMessages = async (conversationId: number, page = 0, size = 20) => {
  try {
    const response = await fetch(
      `/api/messages/conversations/${conversationId}/messages?page=${page}&size=${size}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const getAllMessages = async (conversationId: number) => {
  try {
    // Thêm timestamp vào URL để ngăn cache thay vì dùng header
    const response = await fetchWithAuth<any>(`/api/messages/conversations/${conversationId}/messages/all?_t=${Date.now()}`, {
      method: 'GET',
      credentials: 'include',
      // Đã xóa header Cache-Control gây lỗi CORS
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching all messages:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (conversationId: number) => {
  try {
    const response = await fetch(`/api/messages/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to mark messages as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

export const sendMessage = async (conversationId: number, content: string, mediaUrl?: string, mediaType?: string) => {
  try {
    const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        content,
        mediaUrl,
        mediaType,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const createConversation = async (recipientId: number) => {
  try {
    const response = await fetch(`/api/messages/conversations?recipientId=${recipientId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Lấy danh sách bạn bè cho trang tin nhắn
export const getFriendsForMessaging = async () => {
  try {
    const response = await fetch('/api/messages/friends', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch friends for messaging');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching friends for messaging:', error);
    throw error;
  }
};

// Bắt đầu cuộc trò chuyện với một người bạn
export const startConversation = async (friendId: number) => {
  try {
    const response = await fetch(`/api/messages/start-conversation?friendId=${friendId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to start conversation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error;
  }
};

/**
 * Lấy các tin nhắn mới trong một cuộc trò chuyện dựa trên ID tin nhắn cuối cùng đã biết
 * @param conversationId ID của cuộc trò chuyện
 * @param lastMessageId ID của tin nhắn cuối cùng đã biết
 * @returns Danh sách các tin nhắn mới
 */
export const getRecentMessages = async (conversationId: number, lastMessageId: number) => {
  try {
    console.log(`Fetching recent messages for conversation ${conversationId} after ID ${lastMessageId}`);
    
    // Bỏ qua nếu lastMessageId không hợp lệ
    if (!lastMessageId || lastMessageId <= 0) {
      console.warn("Invalid lastMessageId, skipping recent messages fetch");
      return [];
    }

    const apiUrl = `/api/messages/conversations/${conversationId}/messages/recent?lastMessageId=${lastMessageId}`;
    console.log(`Calling API: ${apiUrl}`);
    
    // Gọi API backend để lấy tin nhắn mới
    const response: any = await fetchWithAuth(apiUrl);
    
    // Kiểm tra định dạng kết quả
    if (Array.isArray(response)) {
      console.log(`Received ${response.length} new messages from API`);
      return response;
    } else if (response && typeof response === 'object') {
      // Kiểm tra xem có thuộc tính messages hoặc content không
      if (Array.isArray(response.messages)) {
        console.log(`Received ${response.messages.length} new messages from 'messages' property`);
        return response.messages;
      } else if (Array.isArray(response.content)) {
        console.log(`Received ${response.content.length} new messages from 'content' property`);
        return response.content;
      }
    }
    
    console.warn("Unexpected response format from recent messages API:", response);
    return []; // Trả về mảng rỗng nếu không xác định được định dạng
  } catch (error) {
    console.error("Error fetching recent messages:", error);
    return []; // Trả về mảng rỗng trong trường hợp lỗi
  }
};

// Restore FriendshipApi class
export class FriendshipApi {
  static async sendRequest(userId: number): Promise<void> {
    try {
      // Kiểm tra trạng thái kết bạn trước khi gửi lời mời
      const status = await this.getFriendshipStatus(userId);
      console.log(`Trạng thái kết bạn với userId ${userId}:`, status);
      
      // Nếu đã là bạn bè, không gửi lời mời nữa
      if (status === 'ACCEPTED') {
        throw new Error('Người dùng này đã là bạn bè của bạn');
      }
      
      // Nếu đã gửi lời mời, không gửi nữa
      if (status === 'PENDING') {
        throw new Error('Đã gửi lời mời kết bạn cho người này rồi');
      }
      
      // Nếu đã nhận lời mời từ đối phương, hãy chấp nhận luôn
      if (status === 'PENDING_RECEIVED') {
        // Tìm requestId từ danh sách lời mời đang chờ
        const pendingRequestsResponse = await this.getPendingRequests();
        const pendingRequests = pendingRequestsResponse.content || [];
        
        for (const req of pendingRequests) {
          if (req.user && req.user.id === userId) {
            await this.acceptRequest(req.id);
            return;
          }
        }
      }
      
      // Nếu chưa kết bạn hoặc trường hợp khác, gửi lời mời
      await fetchWithAuth(`/api/friendship/request/${userId}`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error(`Lỗi khi gửi lời mời kết bạn đến userId ${userId}:`, error);
      throw error;
    }
  }
  
  static async getFriendshipStatus(userId: number): Promise<string> {
    return await fetchWithAuth(`/api/friendship/status/${userId}`, {
      credentials: 'include',
    });
  }

  static async acceptRequest(requestId: number): Promise<void> {
    try {
      await fetchWithAuth(`/api/friendship/accept/${requestId}`, {
        method: 'PUT',
        credentials: 'include',
      });
      
      // Đánh dấu danh sách bạn bè cần được làm mới
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('friends_list_needs_refresh', 'true');
        window.localStorage.setItem('friendship_updated_at', Date.now().toString());
        
        // Xóa cache để đảm bảo dữ liệu mới được tải
        try {
          window.localStorage.removeItem('cached_friends');
        } catch (e) {
          console.error("Lỗi khi xóa cache bạn bè:", e);
        }
      }
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
      throw error;
    }
  }

  static async rejectRequest(userId: number): Promise<void> {
    await fetchWithAuth(`/api/friendship/reject/${userId}`, {
      method: 'PUT',
      credentials: 'include',
    });
  }

  static async cancelRequest(userId: number): Promise<void> {
    await fetchWithAuth(`/api/friendship/cancel/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  static async getPendingRequests(page: number = 0, size: number = 10): Promise<Page<FriendRequestDto>> {
    return await fetchWithAuth(`/api/friendship/requests/pending?page=${page}&size=${size}`, {
      credentials: 'include',
    });
  }

  static async getFriends(page = 0, size = 10, forceRefresh = false) {
    try {
      // Kiểm tra nếu đang offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('Đang offline, trả về danh sách bạn bè trống');
        return { content: [], totalElements: 0 };
      }

      // Thêm timeout để tránh chờ đợi quá lâu
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Tăng timeout lên 10 giây

      try {
        // Thêm tham số forceRefresh vào URL để đảm bảo không lấy dữ liệu cache từ phía server
        // Thêm timestamp vào URL để ngăn cache thay vì dùng header
        const cacheParam = forceRefresh ? `&forceRefresh=true&_t=${Date.now()}` : `&_t=${Date.now()}`;
        
        // Gọi trực tiếp endpoint với signal để hỗ trợ timeout
        // Xóa các header gây lỗi CORS
        console.log(`Đang gọi API getFriends với forceRefresh=${forceRefresh}`);
        const response = await fetchWithAuth(`/api/friendship/friends?page=${page}&size=${size}${cacheParam}`, {
          signal: controller.signal
          // Đã xóa các header Cache-Control, Pragma, Expires gây lỗi CORS
        });
        
        // Xóa timeout nếu thành công
        clearTimeout(timeoutId);
        
        console.log("Dữ liệu trả về từ API getFriends:", response);
        
        // Kiểm tra dữ liệu trả về
        if (response === null || response === undefined) {
          console.warn('API trả về null hoặc undefined, sử dụng dữ liệu trống');
          return { content: [], totalElements: 0 };
        }
        
        // Đảm bảo response có cấu trúc đúng với thuộc tính content
        const typedResponse = response as any; // Type assertion để tránh lỗi TypeScript
        if (!typedResponse.content && Array.isArray(typedResponse)) {
          // Nếu response là một mảng, bọc nó trong đối tượng có content
          return { content: typedResponse, totalElements: typedResponse.length };
        }
        
        return typedResponse;
      } catch (fetchError) {
        // Xóa timeout nếu có lỗi
        clearTimeout(timeoutId);
        console.error("Lỗi khi gọi API getFriends:", fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.warn('Lỗi khi gọi API từ endpoint /api/friendship/friends:', error);
      // Luôn trả về đối tượng hợp lệ với mảng rỗng để tránh lỗi null
      return { content: [], totalElements: 0 };
    }
  }

  static async getSuggestions(page: number = 0, size: number = 10): Promise<Page<UserDto>> {
    return await fetchWithAuth(`/api/friendship/suggestions?page=${page}&size=${size}`, {
      credentials: 'include',
    });
  }

  static async unfriend(userId: number): Promise<void> {
    console.log(`Đang xóa bạn bè có ID: ${userId}`);
    
    try {
      console.log(`Gọi endpoint: /api/friendship/remove/${userId}`);
      // Không type Response, để fetchWithAuth tự xác định kiểu trả về
      await fetchWithAuth(`/api/friendship/remove/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        // Đã xóa header Cache-Control gây lỗi CORS
      });
      
      console.log(`Đã xóa bạn bè có ID: ${userId} thành công`);
      
      // Xóa cache và đánh dấu cần làm mới dữ liệu
      if (typeof window !== 'undefined') {
        // Xóa cache bạn bè
        try {
          localStorage.removeItem('cached_friends');
          localStorage.setItem('friends_list_needs_refresh', 'true');
          localStorage.setItem('friendship_updated_at', Date.now().toString());
          
          // Xóa cache tìm kiếm (nếu có)
          const cachedSearchKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('search_') || key.includes('friendship_')
          );
          
          for (const key of cachedSearchKeys) {
            localStorage.removeItem(key);
          }
          
          console.log("Đã xóa cache bạn bè và tìm kiếm");
        } catch (error) {
          console.error("Lỗi khi xóa cache:", error);
        }
      }
    } catch (error) {
      console.error(`Lỗi khi xóa bạn bè:`, error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  static async getMutualCount(userId: number): Promise<number> {
    return await fetchWithAuth(`/api/friendship/mutual/${userId}/count`, {
      credentials: 'include',
    });
  }

  static async getMutualFriends(userId: number, page: number = 0, size: number = 10): Promise<Page<UserDto>> {
    return await fetchWithAuth(`/api/friendship/mutual/${userId}?page=${page}&size=${size}`, {
      credentials: 'include',
    });
  }
}

// Authentication related functions
export const login = async (username: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    // Đăng nhập thành công, trạng thái online đã được cập nhật ở server
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// NotificationApi cho việc gọi các endpoint thông báo
export const NotificationApi = {
  // Lấy tất cả thông báo (có phân trang)
  getAll: async (page: number = 0, size: number = 20): Promise<PagedResponse<NotificationDto>> => {
    try {
      // Lấy userId từ localStorage thay vì dùng giá trị cố định
      const userId = typeof window !== 'undefined' 
        ? parseInt(localStorage.getItem('currentUserId') || '0', 10) 
        : 0;
        
      if (!userId) {
        console.warn('Không tìm thấy ID người dùng hiện tại');
        return { 
          content: [], 
          page: { 
            size, 
            totalElements: 0, 
            totalPages: 0, 
            number: 0 
          } 
        } as PagedResponse<NotificationDto>;
      }
        
      return await fetchWithAuth(`/api/notifications?userId=${userId}&page=${page}&size=${size}`);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thông báo:', error);
      return { 
        content: [], 
        page: { 
          size, 
          totalElements: 0, 
          totalPages: 0, 
          number: 0 
        } 
      } as PagedResponse<NotificationDto>;
    }
  },

  // Lấy thông báo chưa đọc
  getUnread: async (): Promise<NotificationDto[]> => {
    try {
      // Lấy userId từ localStorage thay vì dùng giá trị cố định
      const userId = typeof window !== 'undefined' 
        ? parseInt(localStorage.getItem('currentUserId') || '0', 10) 
        : 0;
        
      if (!userId) {
        console.warn('Không tìm thấy ID người dùng hiện tại');
        return [];
      }
        
      return await fetchWithAuth(`/api/notifications/unread?userId=${userId}`);
    } catch (error) {
      console.error('Lỗi khi lấy thông báo chưa đọc:', error);
      return [];
    }
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async (): Promise<number> => {
    try {
      // Lấy userId từ localStorage thay vì dùng giá trị cố định
      const userId = typeof window !== 'undefined' 
        ? parseInt(localStorage.getItem('currentUserId') || '0', 10) 
        : 0;
        
      if (!userId) {
        console.warn('Không tìm thấy ID người dùng hiện tại');
        return 0;
      }
        
      return await fetchWithAuth(`/api/notifications/count?userId=${userId}`);
    } catch (error) {
      console.error('Lỗi khi lấy số lượng thông báo chưa đọc:', error);
      return 0;
    }
  },

  // Đánh dấu một thông báo đã đọc
  markAsRead: async (notificationId: number): Promise<NotificationDto> => {
    try {
      // Lấy userId từ localStorage thay vì dùng giá trị cố định
      const userId = typeof window !== 'undefined' 
        ? parseInt(localStorage.getItem('currentUserId') || '0', 10) 
        : 0;
        
      if (!userId) {
        console.warn('Không tìm thấy ID người dùng hiện tại');
        throw new Error('Không tìm thấy ID người dùng hiện tại');
      }
        
      return await fetchWithAuth(`/api/notifications/${notificationId}/read?userId=${userId}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error(`Lỗi khi đánh dấu thông báo ${notificationId} đã đọc:`, error);
      throw error;
    }
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: async (): Promise<void> => {
    try {
      // Lấy userId từ localStorage thay vì dùng giá trị cố định
      const userId = typeof window !== 'undefined' 
        ? parseInt(localStorage.getItem('currentUserId') || '0', 10) 
        : 0;
        
      if (!userId) {
        console.warn('Không tìm thấy ID người dùng hiện tại');
        throw new Error('Không tìm thấy ID người dùng hiện tại');
      }
        
      await fetchWithAuth(`/api/notifications/read-all?userId=${userId}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
      throw error;
    }
  },

  // Xóa một thông báo
  delete: async (notificationId: number): Promise<void> => {
    try {
      // Lấy userId từ localStorage thay vì dùng giá trị cố định
      const userId = typeof window !== 'undefined' 
        ? parseInt(localStorage.getItem('currentUserId') || '0', 10) 
        : 0;
        
      if (!userId) {
        console.warn('Không tìm thấy ID người dùng hiện tại');
        throw new Error('Không tìm thấy ID người dùng hiện tại');
      }
        
      await fetchWithAuth(`/api/notifications/${notificationId}?userId=${userId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Lỗi khi xóa thông báo ${notificationId}:`, error);
      throw error;
    }
  }
}

/**
 * API xử lý các chức năng liên quan đến profile người dùng
 */
export class ProfileApi {
  /**
   * Lấy thông tin profile người dùng theo ID
   * @param userId ID của người dùng
   * @returns Thông tin chi tiết của người dùng
   */
  static async getUserProfileById(userId: number): Promise<UserDto> {
    try {
      return await fetchWithAuth<UserDto>(`/api/users/${userId}`);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin profile theo ID:", error);
      throw new Error("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    }
  }

  /**
   * Lấy thông tin profile người dùng theo username
   * @param username Username của người dùng
   * @returns Thông tin chi tiết của người dùng
   */
  static async getUserProfileByUsername(username: string): Promise<UserDto> {
    try {
      return await fetchWithAuth<UserDto>(`/api/users/profile/${username}`);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin profile theo username:", error);
      throw new Error("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    }
  }

  /**
   * Lấy thông tin profile người dùng với thông tin bạn bè
   * @param userId ID của người dùng
   * @returns Thông tin chi tiết của người dùng bao gồm trạng thái bạn bè
   */
  static async getUserProfileWithFriendship(userId: number): Promise<UserDto> {
    try {
      const userProfile = await this.getUserProfileById(userId);
      const friendshipStatus = await FriendshipApi.getFriendshipStatus(userId);
      
      return {
        ...userProfile,
        isFriend: friendshipStatus === 'ACCEPTED',
        pendingFriendRequest: friendshipStatus === 'PENDING',
        receivedFriendRequest: friendshipStatus === 'RECEIVED'
      };
    } catch (error) {
      console.error("Lỗi khi lấy thông tin profile với trạng thái bạn bè:", error);
      throw new Error("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    }
  }

  /**
   * Kiểm tra xem có phải profile của người dùng hiện tại không
   * @param userId ID của người dùng cần kiểm tra
   * @returns true nếu là profile của người dùng hiện tại
   */
  static isCurrentUserProfile(userId: number): boolean {
    const currentUserId = typeof window !== 'undefined' 
      ? parseInt(localStorage.getItem('currentUserId') || '0', 10) 
      : 0;
    return userId === currentUserId;
  }
}