package com.example.server.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.server.dto.UserDto;
import com.example.server.exception.UserException;
import com.example.server.models.FriendRequest;
import com.example.server.models.User;
import com.example.server.requests.UserRequest;

public interface UserService {

    public User findByEmail(String email) throws UserException;

    public User findUserById(Long userId) throws UserException;

    public User findUserProfileByJwt(String jwt) throws UserException;

    public User updateUser(Long userId, UserDto dto) throws UserException;
    
    public User createUser(UserRequest req) throws UserException;
    
    public User updateUser(Long userId, UserRequest req) throws UserException;

    public User followUser(Long userId, User user) throws UserException;

    public Page<User> searchUser(String query, Pageable pageable) throws UserException;
    
    public Page<User> findAllUsers(Pageable pageable);
    
    public Page<User> findActiveUsers(Pageable pageable);
    
    public Page<User> findLockedUsers(Pageable pageable);
    
    public User lockUser(Long userId) throws UserException;
    
    public User unlockUser(Long userId) throws UserException;

    FriendRequest sendFriendRequest(Long receiverId, User sender) throws UserException;
    FriendRequest acceptFriendRequest(Long requestId, User receiver) throws UserException;
    void rejectFriendRequest(Long requestId, User receiver) throws UserException;
    void removeFriend(Long friendId, User user) throws UserException;
    List<FriendRequest> getPendingFriendRequests(User user);
    
    // Kiểm tra xem hai người dùng có phải là bạn bè không
    boolean isFriend(Long userId1, Long userId2) throws UserException;
    
    // Kiểm tra xem có lời mời kết bạn đang chờ xử lý từ userId1 đến userId2 không
    boolean hasPendingFriendRequest(Long userId1, Long userId2) throws UserException;

    void updateOnlineStatus(Long userId, int isOnline);
}
