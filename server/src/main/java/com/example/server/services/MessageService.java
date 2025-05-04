package com.example.server.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.server.dto.ConversationDto;
import com.example.server.dto.MessageDto;

public interface MessageService {
    
    // Lấy danh sách hội thoại của người dùng
    List<ConversationDto> getConversationsForUser(Long userId);
    
    // Lấy danh sách hội thoại có phân trang
    Page<ConversationDto> getConversationsForUser(Long userId, Pageable pageable);
    
    // Lấy danh sách tin nhắn trong một hội thoại
    List<MessageDto> getMessagesForConversation(Long conversationId, Long userId);
    
    // Lấy danh sách tin nhắn có phân trang
    Page<MessageDto> getMessagesForConversation(Long conversationId, Long userId, Pageable pageable);
    
    // Tạo một hội thoại mới
    ConversationDto createConversation(Long creatorId, Long recipientId);
    
    // Gửi tin nhắn
    MessageDto sendMessage(Long conversationId, Long senderId, String content, String mediaUrl, String mediaType);
    
    // Đánh dấu tin nhắn đã đọc
    void markMessagesAsRead(Long conversationId, Long userId);
    
    // Lấy thông tin hội thoại
    ConversationDto getConversation(Long conversationId, Long userId);
    
    // Tìm hoặc tạo hội thoại giữa hai người dùng
    ConversationDto findOrCreateConversation(Long userId1, Long userId2);
    
    // Lấy tin nhắn mới sau messageId
    List<MessageDto> getRecentMessagesForConversation(Long conversationId, Long userId, Long lastMessageId);
    
    MessageDto createMessage(Long conversationId, Long senderId, String content);
} 