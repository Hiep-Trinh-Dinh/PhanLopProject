package com.example.server.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "JSON")
    private String comments;

    @Enumerated(EnumType.STRING)
    private Privacy privacy = Privacy.PUBLIC;

    @Column(name = "like_count")
    private Integer likeCount = 0;

    @Column(name = "comment_count")
    private Integer commentCount = 0;

    @Column(name = "share_count")
    private Integer shareCount = 0;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @ElementCollection
    @CollectionTable(name = "post_media")
    private List<PostMedia> media = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "post_likes")
    private List<PostLike> likes = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Embeddable
    @Data
    public static class PostMedia {
        @Enumerated(EnumType.STRING)
        @Column(name = "media_type", nullable = false)
        private MediaType mediaType;

        @Column(name = "media_url", nullable = false)
        private String mediaUrl;

        @Column(name = "created_at")
        private LocalDateTime createdAt;

        public enum MediaType {
            IMAGE, VIDEO
        }

        @PrePersist
        protected void onCreate() {
            createdAt = LocalDateTime.now();
        }
    }

    @Embeddable
    @Data
    public static class PostLike {
        @ManyToOne
        @JoinColumn(name = "user_id", nullable = false)
        private User user;

        @Column(name = "created_at")
        private LocalDateTime createdAt;

        @PrePersist
        protected void onCreate() {
            createdAt = LocalDateTime.now();
        }
    }

    public enum Privacy {
        PUBLIC, FRIENDS, PRIVATE
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 