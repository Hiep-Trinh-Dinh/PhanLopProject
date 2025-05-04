package com.example.server.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.server.models.Conversation;
import com.example.server.models.User;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    @Query("SELECT c FROM Conversation c WHERE (c.creator.id = :userId OR c.recipient.id = :userId) ORDER BY c.lastMessageTime DESC")
    List<Conversation> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT c FROM Conversation c WHERE (c.creator.id = :userId OR c.recipient.id = :userId) ORDER BY c.lastMessageTime DESC")
    Page<Conversation> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT c FROM Conversation c WHERE (c.creator.id = :userId1 AND c.recipient.id = :userId2) OR (c.creator.id = :userId2 AND c.recipient.id = :userId1)")
    Optional<Conversation> findConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    List<Conversation> findByCreatorOrRecipientOrderByLastMessageTimeDesc(User creator, User recipient);
} 