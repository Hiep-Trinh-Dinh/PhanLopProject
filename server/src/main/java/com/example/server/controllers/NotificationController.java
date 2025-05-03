package com.example.server.controllers;

import com.example.server.dto.NotificationDto;
import com.example.server.services.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationDto>> getNotifications(
            @RequestParam(value = "userId", required = true) Long userId,
            @PageableDefault(size = 20) Pageable pageable) {
        
        logger.info("Fetching notifications for user ID: {}", userId);
        
        Page<NotificationDto> notifications = notificationService.getNotificationsForUser(userId, pageable);
        
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(
            @RequestParam(value = "userId", required = true) Long userId) {
        
        logger.info("Fetching unread notifications for user ID: {}", userId);
        
        List<NotificationDto> notifications = notificationService.getUnreadNotifications(userId);
        
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadNotificationsCount(
            @RequestParam(value = "userId", required = true) Long userId) {
        
        logger.info("Fetching unread notification count for user ID: {}", userId);
        
        Long count = notificationService.getUnreadNotificationsCount(userId);
        
        return new ResponseEntity<>(count, HttpStatus.OK);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDto> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam(value = "userId", required = true) Long userId) {
        
        logger.info("Marking notification {} as read for user ID: {}", notificationId, userId);
        
        NotificationDto notification = notificationService.markAsRead(notificationId, userId);
        
        return new ResponseEntity<>(notification, HttpStatus.OK);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestParam(value = "userId", required = true) Long userId) {
        
        logger.info("Marking all notifications as read for user ID: {}", userId);
        
        notificationService.markAllAsRead(userId);
        
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId,
            @RequestParam(value = "userId", required = true) Long userId) {
        
        logger.info("Deleting notification {} for user ID: {}", notificationId, userId);
        
        notificationService.deleteNotification(notificationId, userId);
        
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
} 