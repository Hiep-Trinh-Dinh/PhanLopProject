package com.example.server.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@Entity
@Table(name = "group_table")
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;
    private String avatar;
    private String cover;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Privacy privacy = Privacy.PUBLIC;

    @Column(name = "member_count")
    private Integer memberCount = 0;

    @Column(name = "post_count")
    private Integer postCount = 0;

    @Column(name = "media_count")
    private Integer mediaCount = 0;

    @ElementCollection
    @CollectionTable(name = "group_rules")
    private List<String> rules = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ElementCollection
    @CollectionTable(name = "group_members")
    private List<GroupMember> members = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Embeddable
    @Data
    public static class GroupMember {
        @ManyToOne
        @JoinColumn(name = "user_id", nullable = false)
        private User user;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private Role role = Role.MEMBER;

        @Column(name = "is_notified")
        private Boolean isNotified = true;

        @Column(name = "joined_at")
        private LocalDateTime joinedAt;

        @Column(name = "last_active_at")
        private LocalDateTime lastActiveAt;

        @Column(name = "post_count")
        private Integer postCount = 0;

        @Column(name = "media_count")
        private Integer mediaCount = 0;

        public enum Role {
            ADMIN, MODERATOR, MEMBER
        }

        @PrePersist
        protected void onCreate() {
            joinedAt = LocalDateTime.now();
            lastActiveAt = LocalDateTime.now();
        }

        @PreUpdate
        protected void onUpdate() {
            lastActiveAt = LocalDateTime.now();
        }
    }

    public enum Privacy {
        PUBLIC, PRIVATE
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