// src/services/commentService.js
const API_BASE_URL = 'http://localhost:8080/api';

export const commentService = {
  // Lấy danh sách bình luận theo bài viết
  getCommentsByPost: async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Thêm bình luận mới
  createComment: async (postId, commentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(commentData),
      });
      if (!response.ok) {
        throw new Error('Failed to create comment');
      }
      return response.json();
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  // Xóa bình luận
  deleteComment: async (commentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
};
