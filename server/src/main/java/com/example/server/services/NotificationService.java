package com.example.server.services;

import com.example.server.dto.NotificationDto;
import com.example.server.models.Comment;
import com.example.server.models.Notification;
import com.example.server.models.Post;
import com.example.server.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    
    // Phương thức lấy thông báo
    Page<NotificationDto> getNotificationsForUser(Long userId, Pageable pageable);
    List<NotificationDto> getUnreadNotifications(Long userId);
    Long getUnreadNotificationsCount(Long userId);
    
    // Phương thức quản lý trạng thái
    NotificationDto markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long notificationId, Long userId);
    
    // Phương thức tạo thông báo cho các event khác nhau
    Notification createFriendRequestNotification(User sender, User receiver);
    Notification createFriendAcceptedNotification(User sender, User receiver);
    Notification createNewPostNotification(Post post, List<User> recipients);
    Notification createPostLikeNotification(Post post, User actor);
    Notification createPostCommentNotification(Post post, Comment comment, User actor);
    Notification createPostShareNotification(Post post, User actor);
    Notification createMembershipRequestNotification(User requester, User groupAdmin, Long groupId);
    Notification createMembershipRequestAcceptedOrNottification(User groupAdmin, User requester, Long groupId);
} 