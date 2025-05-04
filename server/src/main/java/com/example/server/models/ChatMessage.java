package com.example.server.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private MessageType type;
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderImage;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;
    
    // Loại tin nhắn websocket
    public enum MessageType {
        CHAT,           // Tin nhắn chat thông thường
        JOIN,           // Thông báo tham gia cuộc trò chuyện
        LEAVE,          // Thông báo rời khỏi cuộc trò chuyện
        TYPING,         // Thông báo đang nhập
        READ,           // Thông báo đã đọc
        NOTIFICATION    // Thông báo khác
    }
} 