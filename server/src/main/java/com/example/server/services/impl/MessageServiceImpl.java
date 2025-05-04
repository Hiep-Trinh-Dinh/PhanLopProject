package com.example.server.services.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.server.dto.ConversationDto;
import com.example.server.dto.MessageDto;
import com.example.server.exception.UserNotFoundException;
import com.example.server.mapper.ConversationDtoMapper;
import com.example.server.mapper.MessageDtoMapper;
import com.example.server.models.Conversation;
import com.example.server.models.Message;
import com.example.server.models.User;
import com.example.server.repositories.ConversationRepository;
import com.example.server.repositories.MessageRepository;
import com.example.server.repositories.UserRepository;
import com.example.server.services.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.UnauthorizedException;

@Service
public class MessageServiceImpl implements MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConversationDtoMapper conversationDtoMapper;
    private final MessageDtoMapper messageDtoMapper;
    private static final Logger logger = LoggerFactory.getLogger(MessageServiceImpl.class);
    
    public MessageServiceImpl(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepository userRepository,
            ConversationDtoMapper conversationDtoMapper,
            MessageDtoMapper messageDtoMapper) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.conversationDtoMapper = conversationDtoMapper;
        this.messageDtoMapper = messageDtoMapper;
    }

    @Override
    public List<ConversationDto> getConversationsForUser(Long userId) {
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        
        return conversations.stream()
                .map(conversation -> conversationDtoMapper.toDto(conversation, userId))
                .collect(Collectors.toList());
    }

    @Override
    public Page<ConversationDto> getConversationsForUser(Long userId, Pageable pageable) {
        Page<Conversation> conversationsPage = conversationRepository.findByUserId(userId, pageable);
        
        return conversationsPage.map(conversation -> conversationDtoMapper.toDto(conversation, userId));
    }

    @Override
    @Transactional
    public List<MessageDto> getMessagesForConversation(Long conversationId, Long userId) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
            
            List<Message> messages = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);
            
            // Đánh dấu tin nhắn đã đọc
            markMessagesAsRead(conversationId, userId);
            
            return messages.stream()
                    .map(message -> messageDtoMapper.toDto(message, userId))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Log lỗi chi tiết nhưng trả về mảng rỗng thay vì ném ngoại lệ
            System.err.println("Error getting messages for conversation " + conversationId + ": " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional
    public Page<MessageDto> getMessagesForConversation(Long conversationId, Long userId, Pageable pageable) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
            
            Page<Message> messagePage = messageRepository.findByConversationOrderByCreatedAtDesc(conversation, pageable);
            
            // Đánh dấu tin nhắn đã đọc
            markMessagesAsRead(conversationId, userId);
            
            return messagePage.map(message -> messageDtoMapper.toDto(message, userId));
        } catch (Exception e) {
            System.err.println("Error getting paginated messages for conversation " + conversationId + ": " + e.getMessage());
            e.printStackTrace();
            return new PageImpl<>(new ArrayList<>(), pageable, 0);
        }
    }

    @Override
    @Transactional
    public ConversationDto createConversation(Long creatorId, Long recipientId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new UserNotFoundException("Creator not found"));
        
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new UserNotFoundException("Recipient not found"));
        
        // Kiểm tra xem hội thoại đã tồn tại chưa
        Optional<Conversation> existingConversation = conversationRepository
                .findConversationBetweenUsers(creatorId, recipientId);
        
        if (existingConversation.isPresent()) {
            return conversationDtoMapper.toDto(existingConversation.get(), creatorId);
        }
        
        // Tạo hội thoại mới
        Conversation conversation = new Conversation();
        conversation.setCreator(creator);
        conversation.setRecipient(recipient);
        conversation.setIsGroup(false);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        
        Conversation savedConversation = conversationRepository.save(conversation);
        
        return conversationDtoMapper.toDto(savedConversation, creatorId);
    }

    @Override
    @Transactional
    public MessageDto sendMessage(Long conversationId, Long senderId, String content, String mediaUrl, String mediaType) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException("Sender not found"));
        
        // Tạo tin nhắn mới
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content);
        message.setIsRead(false);
        message.setMediaUrl(mediaUrl);
        message.setMediaType(mediaType);
        message.setCreatedAt(LocalDateTime.now());
        message.setUpdatedAt(LocalDateTime.now());
        
        Message savedMessage = messageRepository.save(message);
        
        // Cập nhật thông tin cuộc trò chuyện
        conversation.updateLastMessage(content, LocalDateTime.now());
        
        // Tăng số tin nhắn chưa đọc cho người nhận
        Long recipientId = getRecipientId(conversation, senderId);
        conversation.incrementUnreadCount(recipientId);
        
        conversationRepository.save(conversation);
        
        return messageDtoMapper.toDto(savedMessage, senderId);
    }

    @Override
    @Transactional
    public void markMessagesAsRead(Long conversationId, Long userId) {
        // Đánh dấu tin nhắn đã đọc
        messageRepository.markMessagesAsRead(conversationId, userId);
        
        // Đặt lại số tin nhắn chưa đọc
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        conversation.resetUnreadCount(userId);
        conversationRepository.save(conversation);
    }

    @Override
    public ConversationDto getConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        return conversationDtoMapper.toDto(conversation, userId);
    }

    @Override
    @Transactional
    public ConversationDto findOrCreateConversation(Long userId1, Long userId2) {
        // Kiểm tra xem hội thoại đã tồn tại chưa
        Optional<Conversation> existingConversation = conversationRepository
                .findConversationBetweenUsers(userId1, userId2);
        
        if (existingConversation.isPresent()) {
            return conversationDtoMapper.toDto(existingConversation.get(), userId1);
        }
        
        // Nếu không tồn tại, tạo hội thoại mới
        return createConversation(userId1, userId2);
    }
    
    private Long getRecipientId(Conversation conversation, Long senderId) {
        if (conversation.getCreator().getId().equals(senderId)) {
            return conversation.getRecipient().getId();
        } else {
            return conversation.getCreator().getId();
        }
    }

    @Override
    public List<MessageDto> getRecentMessagesForConversation(Long conversationId, Long userId, Long lastMessageId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Lấy tất cả tin nhắn có ID lớn hơn lastMessageId trong hội thoại
        List<Message> recentMessages = messageRepository.findRecentMessages(conversation.getId(), lastMessageId);
        
        // Đánh dấu tin nhắn đã đọc
        markMessagesAsRead(conversationId, userId);
        
        return recentMessages.stream()
                .map(message -> messageDtoMapper.toDto(message, userId))
                .collect(Collectors.toList());
    }

    @Override
    public MessageDto createMessage(Long conversationId, Long senderId, String content) {
        logger.info("Creating message in conversation ID: {} from user ID: {}", conversationId, senderId);
        
        try {
            // Tìm cuộc trò chuyện
            Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));
            
            // Tìm người gửi
            User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + senderId));
            
            // Kiểm tra xem người gửi có tham gia cuộc trò chuyện không
            boolean isParticipant = senderId.equals(conversation.getCreator().getId()) || 
                                   senderId.equals(conversation.getRecipient().getId());
            
            if (!isParticipant) {
                throw new UnauthorizedException("User is not a participant in this conversation");
            }
            
            // Tạo tin nhắn mới
            Message message = new Message();
            message.setConversation(conversation);
            message.setSender(sender);
            message.setContent(content);
            message.setIsRead(false);
            message.setCreatedAt(LocalDateTime.now());
            
            // Lưu tin nhắn
            Message savedMessage = messageRepository.save(message);
            logger.info("Message created with ID: {}", savedMessage.getId());
            
            // Cập nhật thời gian cuộc trò chuyện
            conversation.setUpdatedAt(LocalDateTime.now());
            conversationRepository.save(conversation);
            
            // Chuyển đổi và trả về DTO
            MessageDto messageDto = messageDtoMapper.toDto(savedMessage, senderId);
            return messageDto;
        } catch (Exception e) {
            logger.error("Error creating message:", e);
            throw e;
        }
    }
} 