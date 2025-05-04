package com.example.server.controllers;

import com.example.server.dto.NotificationDto;
import com.example.server.models.ChatMessage;
import com.example.server.models.ChatMessage.MessageType;
import com.example.server.models.Notification;
import com.example.server.models.User;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationWebSocketController {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationWebSocketController.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Gửi thông báo kết bạn qua WebSocket
     */
    public void sendFriendRequestNotification(User sender, User receiver, Notification notification) {
        logger.info("Gửi thông báo lời mời kết bạn từ {} đến {}", sender.getId(), receiver.getId());
        
        try {
            NotificationDto notificationDto = NotificationDto.fromEntity(notification);
            
            ChatMessage notificationMessage = new ChatMessage();
            notificationMessage.setType(MessageType.NOTIFICATION);
            notificationMessage.setSenderId(sender.getId());
            notificationMessage.setSenderName(sender.getFirstName() + " " + sender.getLastName());
            notificationMessage.setSenderImage(sender.getImage());
            notificationMessage.setContent(notificationDto.getContent());
            notificationMessage.setTimestamp(notification.getCreatedAt());
            
            // Gửi thông báo đến người nhận
            messagingTemplate.convertAndSendToUser(
                receiver.getId().toString(),
                "/queue/notifications",
                notificationMessage
            );
            
            logger.info("Đã gửi thông báo lời mời kết bạn qua WebSocket");
        } catch (Exception e) {
            logger.error("Lỗi khi gửi thông báo lời mời kết bạn qua WebSocket: ", e);
        }
    }
    
    /**
     * Gửi thông báo chấp nhận kết bạn qua WebSocket
     */
    public void sendFriendAcceptedNotification(User sender, User receiver, Notification notification) {
        logger.info("Gửi thông báo chấp nhận kết bạn từ {} đến {}", sender.getId(), receiver.getId());
        
        try {
            NotificationDto notificationDto = NotificationDto.fromEntity(notification);
            
            ChatMessage notificationMessage = new ChatMessage();
            notificationMessage.setType(MessageType.NOTIFICATION);
            notificationMessage.setSenderId(sender.getId());
            notificationMessage.setSenderName(sender.getFirstName() + " " + sender.getLastName());
            notificationMessage.setSenderImage(sender.getImage());
            notificationMessage.setContent(notificationDto.getContent());
            notificationMessage.setTimestamp(notification.getCreatedAt());
            
            // Gửi thông báo đến người nhận
            messagingTemplate.convertAndSendToUser(
                receiver.getId().toString(),
                "/queue/notifications",
                notificationMessage
            );
            
            logger.info("Đã gửi thông báo chấp nhận kết bạn qua WebSocket");
        } catch (Exception e) {
            logger.error("Lỗi khi gửi thông báo chấp nhận kết bạn qua WebSocket: ", e);
        }
    }
    
    /**
     * Gửi thông báo bất kỳ qua WebSocket
     */
    public void sendNotification(User receiver, Notification notification) {
        logger.info("Gửi thông báo đến người dùng {}", receiver.getId());
        
        try {
            NotificationDto notificationDto = NotificationDto.fromEntity(notification);
            
            ChatMessage notificationMessage = new ChatMessage();
            notificationMessage.setType(MessageType.NOTIFICATION);
            notificationMessage.setContent(notificationDto.getContent());
            notificationMessage.setTimestamp(notification.getCreatedAt());
            
            if (notification.getActor() != null) {
                User actor = notification.getActor();
                notificationMessage.setSenderId(actor.getId());
                notificationMessage.setSenderName(actor.getFirstName() + " " + actor.getLastName());
                notificationMessage.setSenderImage(actor.getImage());
            }
            
            // Gửi thông báo đến người nhận
            messagingTemplate.convertAndSendToUser(
                receiver.getId().toString(),
                "/queue/notifications",
                notificationMessage
            );
            
            logger.info("Đã gửi thông báo qua WebSocket");
        } catch (Exception e) {
            logger.error("Lỗi khi gửi thông báo qua WebSocket: ", e);
        }
    }
} 