package com.example.server.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;
    
    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;
    
    @Column(name = "is_group")
    private Boolean isGroup = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_message_text")
    private String lastMessageText;
    
    @Column(name = "last_message_time")
    private LocalDateTime lastMessageTime;
    
    @Column(name = "unread_count_creator")
    private Integer unreadCountCreator = 0;
    
    @Column(name = "unread_count_recipient")
    private Integer unreadCountRecipient = 0;
    
    public void incrementUnreadCount(Long userId) {
        if (userId.equals(creator.getId())) {
            unreadCountCreator++;
        } else if (userId.equals(recipient.getId())) {
            unreadCountRecipient++;
        }
    }
    
    public void resetUnreadCount(Long userId) {
        if (userId.equals(creator.getId())) {
            unreadCountCreator = 0;
        } else if (userId.equals(recipient.getId())) {
            unreadCountRecipient = 0;
        }
    }
    
    public Integer getUnreadCountForUser(Long userId) {
        if (userId.equals(creator.getId())) {
            return unreadCountCreator;
        } else if (userId.equals(recipient.getId())) {
            return unreadCountRecipient;
        }
        return 0;
    }
    
    public void updateLastMessage(String text, LocalDateTime time) {
        this.lastMessageText = text;
        this.lastMessageTime = time;
        this.updatedAt = time;
    }
} 