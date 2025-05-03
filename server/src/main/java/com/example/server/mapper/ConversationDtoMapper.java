package com.example.server.mapper;

import org.springframework.stereotype.Component;

import com.example.server.dto.ConversationDto;
import com.example.server.dto.UserDto;
import com.example.server.models.Conversation;
import com.example.server.models.User;

@Component
public class ConversationDtoMapper {
    
    private final UserDtoMapper userDtoMapper;
    
    public ConversationDtoMapper(UserDtoMapper userDtoMapper) {
        this.userDtoMapper = userDtoMapper;
    }
    
    public ConversationDto toDto(Conversation conversation, Long currentUserId) {
        ConversationDto dto = new ConversationDto();
        
        dto.setId(conversation.getId());
        dto.setCreator(userDtoMapper.toUserDto(conversation.getCreator()));
        dto.setRecipient(userDtoMapper.toUserDto(conversation.getRecipient()));
        dto.setIsGroup(conversation.getIsGroup());
        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setUpdatedAt(conversation.getUpdatedAt());
        dto.setLastMessageText(conversation.getLastMessageText());
        dto.setLastMessageTime(conversation.getLastMessageTime());
        
        // Đặt số tin nhắn chưa đọc dựa trên người dùng hiện tại
        dto.setUnreadCount(conversation.getUnreadCountForUser(currentUserId));
        
        // Đặt người dùng còn lại trong cuộc trò chuyện
        User otherUser = getOtherUser(conversation, currentUserId);
        if (otherUser != null) {
            dto.setOtherUser(userDtoMapper.toUserDto(otherUser));
        }
        
        return dto;
    }
    
    private User getOtherUser(Conversation conversation, Long currentUserId) {
        if (conversation.getCreator().getId().equals(currentUserId)) {
            return conversation.getRecipient();
        } else if (conversation.getRecipient().getId().equals(currentUserId)) {
            return conversation.getCreator();
        }
        return null;
    }
} 