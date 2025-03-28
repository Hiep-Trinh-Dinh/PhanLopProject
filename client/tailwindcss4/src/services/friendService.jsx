// src/services/friendService.js
const API_BASE_URL = 'http://localhost:8080/api';

export const friendService = {
  // Lấy danh sách bạn bè
  getFriends: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/friends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  },

  // Lấy danh sách yêu cầu kết bạn
  getFriendRequests: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/friend-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch friend requests');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      throw error;
    }
  },

  // Gửi yêu cầu kết bạn
  sendFriendRequest: async (userId, friendId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/friend-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ friendId }),
      });
      if (!response.ok) {
        throw new Error('Failed to send friend request');
      }
      return response.json();
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  // Chấp nhận yêu cầu kết bạn
  acceptFriendRequest: async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/friend-requests/${requestId}/accept`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },

  // Từ chối yêu cầu kết bạn
  rejectFriendRequest: async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/friend-requests/${requestId}/reject`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to reject friend request');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  },

  // Hủy kết bạn
  removeFriend: async (userId, friendId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/friends/${friendId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  },
};
