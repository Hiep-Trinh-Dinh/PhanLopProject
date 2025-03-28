// src/services/postService.js
const API_BASE_URL = 'http://localhost:8080/api';

export const postService = {
  // Lấy tất cả bài viết
  getAllPosts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // Lấy bài viết theo ID
  getPostById: async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  // Tạo bài viết mới
  createPost: async (postData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      return response.json();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Cập nhật bài viết
  updatePost: async (postId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('Failed to update post');
      }
      return response.json();
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Xóa bài viết
  deletePost: async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },
};
