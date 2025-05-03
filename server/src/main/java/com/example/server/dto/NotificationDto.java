package com.example.server.dto;

import com.example.server.models.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private UserDto actor;
    private String type;
    private String content;
    private String link;
    private boolean isRead;
    private LocalDateTime createdAt;
    
    // Thông tin bổ sung cho UI (optional)
    private Long referenceId; // Id của đối tượng liên quan (post, comment, friendship)
    
    public static NotificationDto fromEntity(Notification notification) {
        UserDto actorDto = notification.getActor() != null 
                ? UserDto.fromEntity(notification.getActor(), false) 
                : null;
                
        return NotificationDto.builder()
                .id(notification.getId())
                .actor(actorDto)
                .type(notification.getType().toString())
                .content(notification.getContent())
                .link(notification.getLink())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
} 