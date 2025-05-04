package com.example.server.events;

import com.example.server.models.Notification;
import com.example.server.models.User;
import org.springframework.context.ApplicationEvent;

public class NotificationEvent extends ApplicationEvent {
    private final User sender;
    private final User receiver;
    private final Notification notification;
    private final NotificationType type;
    
    public enum NotificationType {
        FRIEND_REQUEST,
        FRIEND_ACCEPTED,
        GENERAL
    }
    
    private NotificationEvent(Object source, User sender, User receiver, Notification notification, NotificationType type) {
        super(source);
        this.sender = sender;
        this.receiver = receiver;
        this.notification = notification;
        this.type = type;
    }
    
    public static NotificationEvent createFriendRequestEvent(Object source, User sender, User receiver, Notification notification) {
        return new NotificationEvent(source, sender, receiver, notification, NotificationType.FRIEND_REQUEST);
    }
    
    public static NotificationEvent createFriendAcceptedEvent(Object source, User sender, User receiver, Notification notification) {
        return new NotificationEvent(source, sender, receiver, notification, NotificationType.FRIEND_ACCEPTED);
    }
    
    public static NotificationEvent createGeneralEvent(Object source, User receiver, Notification notification) {
        return new NotificationEvent(source, notification.getActor(), receiver, notification, NotificationType.GENERAL);
    }
    
    public User getSender() {
        return sender;
    }
    
    public User getReceiver() {
        return receiver;
    }
    
    public Notification getNotification() {
        return notification;
    }
    
    public NotificationType getType() {
        return type;
    }
} 