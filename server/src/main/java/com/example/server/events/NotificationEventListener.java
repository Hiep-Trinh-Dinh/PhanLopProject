package com.example.server.events;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.example.server.controllers.NotificationWebSocketController;

@Component
public class NotificationEventListener {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationEventListener.class);
    
    @Autowired
    private NotificationWebSocketController webSocketController;
    
    @Async
    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        logger.info("Xử lý sự kiện thông báo loại: {}", event.getType());
        
        switch (event.getType()) {
            case FRIEND_REQUEST:
                webSocketController.sendFriendRequestNotification(
                    event.getSender(),
                    event.getReceiver(), 
                    event.getNotification()
                );
                break;
                
            case FRIEND_ACCEPTED:
                webSocketController.sendFriendAcceptedNotification(
                    event.getSender(),
                    event.getReceiver(),
                    event.getNotification()
                );
                break;
                
            case GENERAL:
                webSocketController.sendNotification(
                    event.getReceiver(),
                    event.getNotification()
                );
                break;
                
            default:
                logger.warn("Không xử lý được loại thông báo: {}", event.getType());
        }
    }
} 