package com.example.server.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@Entity
@Table(name = "stories")
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private MediaType mediaType;

    @Column(name = "duration")
    private Integer duration; // Thời lượng cho video (giây)

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "like_count")
    private Integer likeCount = 0;

    @Column(name = "reply_count")
    private Integer replyCount = 0;

    @ElementCollection
    @CollectionTable(name = "story_views")
    private List<StoryView> views = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_archived")
    private Boolean isArchived = false;

    @Column(name = "is_highlight")
    private Boolean isHighlight = false;

    @Embeddable
    @Data
    public static class StoryView {
        @ManyToOne
        @JoinColumn(name = "user_id", nullable = false)
        private User user;

        @Column(name = "viewed_at")
        private LocalDateTime viewedAt;

        @Column(name = "view_duration")
        private Integer viewDuration; // Thời gian xem (giây)

        @PrePersist
        protected void onCreate() {
            viewedAt = LocalDateTime.now();
        }
    }

    public enum MediaType {
        IMAGE, VIDEO
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        expiresAt = createdAt.plusHours(24); // Story hết hạn sau 24h
    }
} 