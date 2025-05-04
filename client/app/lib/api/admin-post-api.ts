/**
 * Admin Post API Client
 */

export interface AdminPostDto {
  id: number;
  content: string;
  privacy: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  
  // User who created the post
  userId: number;
  username: string;
  userFullName: string;
  userProfilePicture: string;
  
  // Post stats
  likeCount: number;
  commentCount: number;
  shareCount: number;
  
  // Media attached to the post
  media: Array<{
    id: number;
    url: string;
    mediaType: string; // "IMAGE" or "VIDEO"
  }>;
  
  // For managing purposes
  reportCount: string;
  status: 'active' | 'inactive';
  moderationStatus: 'approved' | 'pending' | 'rejected';
  moderationReason: string;
}

export interface AdminPostListResponse {
  posts: AdminPostDto[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const AdminPostApi = {
  /**
   * Get posts with pagination, search, filtering
   */
  async getPosts(
    page: number = 0,
    size: number = 10,
    query: string = '',
    sortBy: string = 'id',
    sortDir: string = 'asc',
    status: string = 'all'
  ): Promise<AdminPostListResponse> {
    try {
      console.log('Calling admin posts API');
      
      const url = new URL(`${API_BASE_URL}/api/admin/posts`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('size', size.toString());
      if (query) url.searchParams.append('query', query);
      url.searchParams.append('sortBy', sortBy);
      url.searchParams.append('sortDir', sortDir);
      url.searchParams.append('status', status);

      console.log('Current cookie:', document.cookie);
      
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
          // Try to parse JSON if available
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Unable to fetch posts list');
        } catch (e) {
          // If not JSON
          throw new Error(response.status === 403 ? 'Forbidden: Access denied' : errorText || 'Unable to fetch posts list');
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching posts list:', error);
      throw error;
    }
  },

  /**
   * Get post details by ID
   */
  async getPostById(postId: number): Promise<AdminPostDto> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || 'Unable to fetch post details');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching post ID ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Update post information
   */
  async updatePost(postId: number, postData: Partial<AdminPostDto>): Promise<AdminPostDto> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || 'Unable to update post');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating post ID ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Lock post (make inactive)
   */
  async lockPost(postId: number): Promise<{ message: string; post: AdminPostDto }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}/lock`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || 'Unable to lock post');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error locking post ID ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Unlock post (make active)
   */
  async unlockPost(postId: number): Promise<{ message: string; post: AdminPostDto }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}/unlock`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || 'Unable to unlock post');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error unlocking post ID ${postId}:`, error);
      throw error;
    }
  }
}; 