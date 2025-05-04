package com.example.server.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.server.dto.FriendshipDto;
import com.example.server.dto.UserDto;
import com.example.server.exception.UserException;

public interface FriendshipService {
    
    // Gửi lời mời kết bạn
    FriendshipDto sendFriendRequest(Long friendId, Long userId) throws UserException;
    
    // Chấp nhận lời mời kết bạn
    FriendshipDto acceptFriendRequest(Long friendshipId, Long userId) throws UserException;
    
    // Từ chối lời mời kết bạn
    void rejectFriendRequest(Long friendshipId, Long userId) throws UserException;
    
    // Hủy lời mời kết bạn đã gửi
    void cancelFriendRequest(Long friendshipId, Long userId) throws UserException;
    
    // Xóa bạn bè
    void removeFriend(Long friendId, Long userId) throws UserException;
    
    // Chặn người dùng
    FriendshipDto blockUser(Long userId, Long blockUserId) throws UserException;
    
    // Bỏ chặn người dùng
    void unblockUser(Long userId, Long blockedUserId) throws UserException;
    
    // Lấy danh sách bạn bè
    List<UserDto> getUserFriends(Long userId) throws UserException;
    
    // Lấy danh sách lời mời kết bạn đã nhận
    List<FriendshipDto> getPendingFriendRequests(Long userId) throws UserException;
    
    // Lấy danh sách lời mời kết bạn đã gửi
    List<FriendshipDto> getSentFriendRequests(Long userId) throws UserException;
    
    // Lấy danh sách người dùng đã chặn
    List<UserDto> getBlockedUsers(Long userId) throws UserException;
    
    // Lấy danh sách gợi ý kết bạn
    Page<UserDto> getFriendSuggestions(Long userId, Pageable pageable) throws UserException;
    
    // Kiểm tra trạng thái quan hệ giữa hai người dùng
    String getFriendshipStatus(Long userId, Long otherUserId) throws UserException;
    
    // Lấy số lượng bạn chung
    Integer getMutualFriendsCount(Long userId, Long otherUserId) throws UserException;
    
    // Tìm kiếm bạn bè
    List<UserDto> searchFriends(Long userId, String query) throws UserException;
} 