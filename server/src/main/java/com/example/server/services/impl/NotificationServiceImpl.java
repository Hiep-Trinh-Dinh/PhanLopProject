package com.example.server.services.impl;

import com.example.server.dto.NotificationDto;
import com.example.server.events.NotificationEvent;
import com.example.server.exceptions.ResourceNotFoundException;
import com.example.server.models.Comment;
import com.example.server.models.Group;
import com.example.server.models.MembershipRequest;
import com.example.server.models.Notification;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.repositories.GroupRepository;
import com.example.server.repositories.MembershipRequestRepository;
import com.example.server.repositories.NotificationRepository;
import com.example.server.repositories.UserRepository;
import com.example.server.services.NotificationService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private MembershipRequestRepository membershipRequestRepository;
    
    @Override
    public Page<NotificationDto> getNotificationsForUser(Long userId, Pageable pageable) {
        logger.info("Fetching notifications for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Page<Notification> notifications = notificationRepository.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(user, pageable);
        logger.info("Found {} notifications for user ID: {}", notifications.getTotalElements(), userId);
        
        return notifications.map(NotificationDto::fromEntity);
    }

    @Override
    public List<NotificationDto> getUnreadNotifications(Long userId) {
        logger.info("Fetching unread notifications for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        List<Notification> notifications = notificationRepository.findByUserAndIsReadFalseAndIsDeletedFalseOrderByCreatedAtDesc(user);
        logger.info("Found {} unread notifications for user ID: {}", notifications.size(), userId);
        
        return notifications.stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public Long getUnreadNotificationsCount(Long userId) {
        logger.info("Counting unread notifications for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Long count = notificationRepository.countByUserAndIsReadFalseAndIsDeletedFalse(user);
        logger.info("User ID: {} has {} unread notifications", userId, count);
        
        return count;
    }

    @Override
    public NotificationDto markAsRead(Long notificationId, Long userId) {
        logger.info("Marking notification ID: {} as read for user ID: {}", notificationId, userId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        
        // Kiểm tra xem notification có thuộc về user không
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for user");
        }
        
        notification.setIsRead(true);
        Notification savedNotification = notificationRepository.save(notification);
        logger.info("Successfully marked notification ID: {} as read", notificationId);
        
        return NotificationDto.fromEntity(savedNotification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        logger.info("Marking all notifications as read for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        notificationRepository.markAllAsRead(user);
        logger.info("Successfully marked all notifications as read for user ID: {}", userId);
    }

    @Override
    public void deleteNotification(Long notificationId, Long userId) {
        logger.info("Deleting notification ID: {} for user ID: {}", notificationId, userId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        
        // Kiểm tra xem notification có thuộc về user không
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for user");
        }
        
        // Soft delete
        notification.setIsDeleted(true);
        notificationRepository.save(notification);
        logger.info("Successfully deleted notification ID: {}", notificationId);
    }

    @Override
    public Notification createFriendRequestNotification(User sender, User receiver) {
        logger.info("Creating friend request notification from user ID: {} to user ID: {}", sender.getId(), receiver.getId());
        Notification notification = new Notification();
        notification.setUser(receiver);
        notification.setActor(sender);
        notification.setType(Notification.NotificationType.FRIEND_REQUEST);
        notification.setContent("đã gửi cho bạn một lời mời kết bạn");
        notification.setLink("/friends/requests");
        notification.setIsRead(false);
        notification.setIsDeleted(false);
        
        Notification savedNotification = notificationRepository.save(notification);
        logger.info("Friend request notification created with ID: {}", savedNotification.getId());
        
        // Phát sự kiện thông báo
        eventPublisher.publishEvent(
            NotificationEvent.createFriendRequestEvent(this, sender, receiver, savedNotification)
        );
        
        return savedNotification;
    }

    @Override
    public Notification createFriendAcceptedNotification(User sender, User receiver) {
        logger.info("Creating friend accepted notification from user ID: {} to user ID: {}", sender.getId(), receiver.getId());
        Notification notification = new Notification();
        notification.setUser(receiver);
        notification.setActor(sender);
        notification.setType(Notification.NotificationType.FRIEND_ACCEPTED);
        notification.setContent("đã chấp nhận lời mời kết bạn của bạn");
        notification.setLink("/profile/" + sender.getId());
        notification.setIsRead(false);
        notification.setIsDeleted(false);
        
        Notification savedNotification = notificationRepository.save(notification);
        logger.info("Friend accepted notification created with ID: {}", savedNotification.getId());
        
        // Phát sự kiện thông báo
        eventPublisher.publishEvent(
            NotificationEvent.createFriendAcceptedEvent(this, sender, receiver, savedNotification)
        );
        
        return savedNotification;
    }

    @Override
    public Notification createNewPostNotification(Post post, List<User> recipients) {
        if (post == null || recipients == null || recipients.isEmpty()) {
            logger.warn("Invalid parameters for post notification creation");
            return null;
        }
        
        logger.info("Creating post created notification from user ID: {} to {} recipients", 
                  post.getUser().getId(), recipients.size());
            
        // Đơn giản hóa: Chỉ tạo một thông báo cho người nhận đầu tiên
        User firstRecipient = recipients.get(0);
        
        Notification notification = new Notification();
        notification.setUser(firstRecipient);
        notification.setActor(post.getUser());
        notification.setType(Notification.NotificationType.POST_CREATED);
        notification.setContent("đã đăng một bài viết mới");
        notification.setLink("/post/" + post.getId());
        notification.setIsRead(false);
        notification.setIsDeleted(false);
        
        Notification savedNotification = notificationRepository.save(notification);
        logger.info("Post notification created with ID: {}", savedNotification.getId());
        
        return savedNotification;
    }

    @Override
    public Notification createPostLikeNotification(Post post, User actor) {
        // Không tạo thông báo nếu người dùng thích bài viết của chính mình
        if (post == null || actor == null || post.getUser().getId().equals(actor.getId())) {
            return null;
        }
        
        logger.info("Creating post like notification from user ID: {} to post owner ID: {}", 
                  actor.getId(), post.getUser().getId());
        
        Notification notification = new Notification();
        notification.setUser(post.getUser());
        notification.setActor(actor);
        notification.setType(Notification.NotificationType.POST_LIKE);
        notification.setContent("đã thích bài viết của bạn");
        notification.setLink("/post/" + post.getId());
        notification.setIsRead(false);
        notification.setIsDeleted(false);
        
        Notification savedNotification = notificationRepository.save(notification);
        logger.info("Post like notification created with ID: {}", savedNotification.getId());
        
        return savedNotification;
    }

    @Override
    public Notification createPostCommentNotification(Post post, Comment comment, User actor) {
        // Không tạo thông báo nếu người dùng bình luận bài viết của chính mình
        if (post == null || comment == null || actor == null || post.getUser().getId().equals(actor.getId())) {
            return null;
        }
        
        logger.info("Creating post comment notification from user ID: {} to post owner ID: {}", 
                  actor.getId(), post.getUser().getId());
        
        Notification notification = new Notification();
        notification.setUser(post.getUser());
        notification.setActor(actor);
        notification.setType(Notification.NotificationType.POST_COMMENT);
        notification.setContent("đã bình luận về bài viết của bạn");
        notification.setLink("/post/" + post.getId());
        notification.setIsRead(false);
        notification.setIsDeleted(false);
        
        Notification savedNotification = notificationRepository.save(notification);
        logger.info("Post comment notification created with ID: {}", savedNotification.getId());
        
        return savedNotification;
    }

    @Override
    public Notification createPostShareNotification(Post post, User actor) {
        // Không tạo thông báo nếu người dùng chia sẻ bài viết của chính mình
        if (post == null || actor == null || post.getUser().getId().equals(actor.getId())) {
            return null;
        }
        
        logger.info("Creating post share notification from user ID: {} to post owner ID: {}", 
                  actor.getId(), post.getUser().getId());
        
        Notification notification = new Notification();
        notification.setUser(post.getUser());
        notification.setActor(actor);
        notification.setType(Notification.NotificationType.POST_SHARE);
        notification.setContent("đã chia sẻ bài viết của bạn");
        notification.setLink("/post/" + post.getId());
        notification.setIsRead(false);
        notification.setIsDeleted(false);
        
        Notification savedNotification = notificationRepository.save(notification);
        logger.info("Post share notification created with ID: {}", savedNotification.getId());
        
        return savedNotification;
    }

    @Override
    public Notification createMembershipRequestNotification(User requester, User groupAdmin, Long groupId) {
        logger.info("Creating membership request notification from user ID: {} to group admin ID: {} for group ID: {}", 
                    requester.getId(), groupAdmin.getId(), groupId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + groupId));

        Notification notification = new Notification();
        notification.setUser(groupAdmin);
        notification.setActor(requester);
        notification.setType(Notification.NotificationType.MEMBERSHIP_REQUEST);
        notification.setContent(String.format("đã gửi yêu cầu tham gia nhóm %s", group.getName()));
        notification.setLink("/groups/" + groupId + "/requests");
        notification.setIsRead(false);
        notification.setIsDeleted(false);

        Notification savedNotification = notificationRepository.save(notification);
        logger.info("Membership request notification created with ID: {}", savedNotification.getId());

        eventPublisher.publishEvent(
            NotificationEvent.createMembershipRequestEvent(this, requester, groupAdmin, savedNotification)
        );

        return savedNotification;
    }

    @Override
    public Notification createMembershipRequestAcceptedOrNottification(User groupAdmin, User requester, Long groupId) {
        logger.info("Creating membership request result notification from admin ID: {} to user ID: {} for group ID: {}", 
                    groupAdmin.getId(), requester.getId(), groupId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + groupId));

        MembershipRequest request = membershipRequestRepository.findByGroupIdAndUserId(groupId, requester.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Membership request not found for user ID: " + requester.getId()));

        Notification notification = new Notification();
        notification.setUser(requester);
        notification.setActor(groupAdmin);
        
        if (request.getStatus() == MembershipRequest.Status.APPROVED) {
            notification.setType(Notification.NotificationType.MEMBERSHIP_REQUEST_ACCEPTED);
            notification.setContent(String.format("Yêu cầu tham gia nhóm %s của bạn đã được chấp nhận", group.getName()));
            notification.setLink("/groups/" + groupId + "/members");
            eventPublisher.publishEvent(
                NotificationEvent.createMembershipRequestAcceptedEvent(this, groupAdmin, requester, notification)
            );
        } else {
            notification.setType(Notification.NotificationType.MEMBERSHIP_REQUEST_REJECTED);
            notification.setContent(String.format("Yêu cầu tham gia nhóm %s của bạn đã bị từ chối", group.getName()));
            notification.setLink("/groups");
            eventPublisher.publishEvent(
                NotificationEvent.createMembershipRequestRejectedEvent(this, groupAdmin, requester, notification)
            );
        }

        notification.setIsRead(false);
        notification.setIsDeleted(false);

        Notification savedNotification = notificationRepository.save(notification);
        logger.info("Membership request result notification created with ID: {}", savedNotification.getId());

        return savedNotification;
    }
    
} 