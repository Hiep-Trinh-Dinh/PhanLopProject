package com.example.server.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDto {
    private Long id;
    private UserDto creator;
    private UserDto recipient;
    private Boolean isGroup;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String lastMessageText;
    private LocalDateTime lastMessageTime;
    private Integer unreadCount;
    private UserDto otherUser; // Người dùng còn lại trong cuộc trò chuyện
} 