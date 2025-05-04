package com.example.server.mapper;

import org.springframework.stereotype.Component;

import com.example.server.dto.MessageDto;
import com.example.server.models.Message;

@Component
public class MessageDtoMapper {
    
    private final UserDtoMapper userDtoMapper;
    
    public MessageDtoMapper(UserDtoMapper userDtoMapper) {
        this.userDtoMapper = userDtoMapper;
    }
    
    public MessageDto toDto(Message message, Long currentUserId) {
        MessageDto dto = new MessageDto();
        
        dto.setId(message.getId());
        dto.setConversationId(message.getConversation().getId());
        dto.setSender(userDtoMapper.toUserDto(message.getSender()));
        dto.setContent(message.getContent());
        dto.setIsRead(message.getIsRead());
        dto.setMediaUrl(message.getMediaUrl());
        dto.setMediaType(message.getMediaType());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());
        
        // Kiểm tra xem tin nhắn có phải từ người dùng hiện tại không
        dto.setIsFromCurrentUser(message.getSender().getId().equals(currentUserId));
        
        return dto;
    }
} 