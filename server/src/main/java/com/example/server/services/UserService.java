package com.example.server.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.server.dto.UserDto;
import com.example.server.exception.UserException;
import com.example.server.models.FriendRequest;
import com.example.server.models.User;

public interface UserService {

    public User findUserById(Long userId) throws UserException;

    public User findUserProfileByJwt(String jwt) throws UserException;

    public User updateUser(Long userId, UserDto dto) throws UserException;

    public User followUser(Long userId, User user) throws UserException;

    public Page<User> searchUser(String query, Pageable pageable) throws UserException;

    FriendRequest sendFriendRequest(Long receiverId, User sender) throws UserException;
    FriendRequest acceptFriendRequest(Long requestId, User receiver) throws UserException;
    void rejectFriendRequest(Long requestId, User receiver) throws UserException;
    void removeFriend(Long friendId, User user) throws UserException;
    List<FriendRequest> getPendingFriendRequests(User user);
}
