package com.example.server.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.server.models.Conversation;
import com.example.server.models.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation);
    
    Page<Message> findByConversationOrderByCreatedAtDesc(Conversation conversation, Pageable pageable);
    
    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    void markMessagesAsRead(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    int countUnreadMessages(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
    
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.id > :lastMessageId ORDER BY m.createdAt ASC")
    List<Message> findRecentMessages(@Param("conversationId") Long conversationId, @Param("lastMessageId") Long lastMessageId);
} 