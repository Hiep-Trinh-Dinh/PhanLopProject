package com.example.server.controllers;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.server.dto.ConversationDto;
import com.example.server.dto.MessageDto;
import com.example.server.dto.UserDto;
import com.example.server.exception.UnauthorizedException;
import com.example.server.models.User;
import com.example.server.requests.MessageRequest;
import com.example.server.responses.ApiResponse;
import com.example.server.services.FriendshipService;
import com.example.server.services.MessageService;
import com.example.server.services.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    
    private final MessageService messageService;

    private final UserService userService;
    private final FriendshipService friendshipService;
    private static final String COOKIE_NAME = "auth_token";
    
    public MessageController(
            MessageService messageService,
            UserService userService,
            FriendshipService friendshipService) {
        this.messageService = messageService;
        this.userService = userService;
        this.friendshipService = friendshipService;
    }
    
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(HttpServletRequest request, Pageable pageable) {
        User user = getUserFromRequest(request);
        
        Page<ConversationDto> conversations = messageService.getConversationsForUser(user.getId(), pageable);
        
        return ResponseEntity.ok(conversations);
    }
    
    @GetMapping("/conversations/all")
    public ResponseEntity<?> getAllConversations(HttpServletRequest request) {
        User user = getUserFromRequest(request);
        
        List<ConversationDto> conversations = messageService.getConversationsForUser(user.getId());
        
        return ResponseEntity.ok(conversations);
    }
    
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<?> getConversation(
            @PathVariable Long conversationId,
            HttpServletRequest request) {
        User user = getUserFromRequest(request);
        
        ConversationDto conversation = messageService.getConversation(conversationId, user.getId());
        
        return ResponseEntity.ok(conversation);
    }
    
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable Long conversationId,
            HttpServletRequest request,
            Pageable pageable) {
        User user = getUserFromRequest(request);
        
        Page<MessageDto> messages = messageService.getMessagesForConversation(conversationId, user.getId(), pageable);
        
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/conversations/{conversationId}/messages/all")
    public ResponseEntity<?> getAllMessages(
            @PathVariable Long conversationId,
            HttpServletRequest request) {
        User user = getUserFromRequest(request);
        
        List<MessageDto> messages = messageService.getMessagesForConversation(conversationId, user.getId());
        
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/conversations/{conversationId}/messages/recent")
    public ResponseEntity<?> getRecentMessages(
            @PathVariable Long conversationId,
            @RequestParam(required = false, defaultValue = "0") Long lastMessageId,
            HttpServletRequest request) {
        User user = getUserFromRequest(request);
        
        try {
            List<MessageDto> messages = messageService.getRecentMessagesForConversation(
                    conversationId, 
                    user.getId(),
                    lastMessageId);
            
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("Không thể lấy tin nhắn mới: " + e.getMessage(), false));
        }
    }
    
    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long conversationId,
            HttpServletRequest request) {
        User user = getUserFromRequest(request);
        
        messageService.markMessagesAsRead(conversationId, user.getId());
        
        return ResponseEntity.ok(new ApiResponse("Messages marked as read", true));
    }
    
    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long conversationId,
            @RequestBody MessageRequest messageRequest,
            HttpServletRequest request) {
        User user = getUserFromRequest(request);
        
        MessageDto message = messageService.sendMessage(
                conversationId, 
                user.getId(), 
                messageRequest.getContent(),
                messageRequest.getMediaUrl(),
                messageRequest.getMediaType());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }
    
    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(
            @RequestParam Long recipientId,
            HttpServletRequest request) {
        User user = getUserFromRequest(request);
        
        ConversationDto conversation = messageService.findOrCreateConversation(user.getId(), recipientId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(conversation);
    }
    
    /**
     * Lấy danh sách bạn bè cho trang tin nhắn
     */
    @GetMapping("/friends")
    public ResponseEntity<?> getFriendsForMessaging(HttpServletRequest request) {
        User user = getUserFromRequest(request);
        
        try {
            List<UserDto> friends = friendshipService.getUserFriends(user.getId());
            return ResponseEntity.ok(friends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse("Không thể lấy danh sách bạn bè: " + e.getMessage(), false));
        }
    }
    
    /**
     * Tạo hoặc lấy cuộc trò chuyện với một người bạn
     */
    @PostMapping("/start-conversation")
    public ResponseEntity<?> startConversation(
            @RequestParam Long friendId,
            HttpServletRequest request) {
        User user = getUserFromRequest(request);
        
        try {
            ConversationDto conversation = messageService.findOrCreateConversation(user.getId(), friendId);
            return ResponseEntity.status(HttpStatus.OK).body(conversation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse("Không thể bắt đầu cuộc trò chuyện: " + e.getMessage(), false));
        }
    }
    
    private User getUserFromRequest(HttpServletRequest request) {
        // Lấy token từ cookie
        Cookie[] cookies = request.getCookies();
        String token = null;
        
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        
        if (token == null) {
            throw new UnauthorizedException("No token found");
        }
        
        try {
            // Lấy thông tin user từ token
            User user = userService.findUserProfileByJwt(token);
            return user;
        } catch (Exception e) {
            throw new UnauthorizedException("User not found");
        }
    }
} 