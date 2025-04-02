package com.example.server.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    private User user;

    private String content;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Like> likes = new ArrayList<>();

    @OneToMany
    private List<Post> replyPosts = new ArrayList<>();

    @ManyToMany
    private List<User> repostUsers = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "post_media")
    private List<PostMedia> media = new ArrayList<>();

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

    @ManyToOne
    private Post replyFor;

    private String image;
    private String video;

    private Boolean isPost;
    private Boolean isReply;

    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
